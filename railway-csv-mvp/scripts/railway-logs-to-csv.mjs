#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

function parseArgs(argv) {
	const result = {};

	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (!arg.startsWith('--')) continue;

		const [flag, inlineValue] = arg.split('=');
		const nextValue = inlineValue ?? argv[i + 1];

		switch (flag) {
			case '--input':
				result.input = nextValue;
				if (inlineValue === undefined) i++;
				break;
			case '--output':
				result.output = nextValue;
				if (inlineValue === undefined) i++;
				break;
			case '--service':
				result.service = nextValue;
				if (inlineValue === undefined) i++;
				break;
			case '--environment':
				result.environment = nextValue;
				if (inlineValue === undefined) i++;
				break;
			case '--since':
				result.since = nextValue;
				if (inlineValue === undefined) i++;
				break;
			default:
				break;
		}
	}

	return result;
}

function csvEscape(value) {
	const stringValue = value == null ? '' : String(value);
	return `"${stringValue.replaceAll('"', '""')}"`;
}

function pickFirstNonEmpty(values) {
	for (const value of values) {
		if (value === undefined || value === null) continue;
		if (typeof value === 'string' && value.trim() === '') continue;
		return value;
	}
	return '';
}

function getNestedValue(object, keys) {
	return keys.reduce((current, key) => (current && current[key] !== undefined ? current[key] : undefined), object);
}

function normalizeLogEntry(entry, context = {}) {
	const timestamp = pickFirstNonEmpty([
		entry.timestamp,
		entry.ts,
		entry.time,
		entry.createdAt,
		entry.created_at,
		getNestedValue(entry, ['metadata', 'timestamp']),
	]);

	const message = pickFirstNonEmpty([
		entry.message,
		entry.msg,
		entry.text,
		entry.line,
		entry.content,
		getNestedValue(entry, ['metadata', 'message']),
	]);

	const service = pickFirstNonEmpty([
		entry.service,
		entry.serviceName,
		entry.service_name,
		getNestedValue(entry, ['service', 'name']),
		context.service,
	]);

	const environment = pickFirstNonEmpty([
		entry.environment,
		entry.environmentName,
		entry.environment_name,
		getNestedValue(entry, ['environment', 'name']),
		context.environment,
	]);

	const level = pickFirstNonEmpty([
		entry.level,
		entry.severity,
		getNestedValue(entry, ['metadata', 'level']),
	]);

	const deploymentId = pickFirstNonEmpty([
		entry.deploymentId,
		entry.deployment_id,
		getNestedValue(entry, ['deployment', 'id']),
	]);

	const source = pickFirstNonEmpty([
		entry.source,
		entry.type,
		entry.kind,
		getNestedValue(entry, ['metadata', 'source']),
		'railway',
	]);

	return {
		timestamp,
		service,
		environment,
		level,
		message,
		deployment_id: deploymentId,
		source,
		raw_json: JSON.stringify(entry),
	};
}

function parseLogPayload(rawText) {
	const trimmed = rawText.trim();
	if (!trimmed) return [];

	try {
		const parsed = JSON.parse(trimmed);
		if (Array.isArray(parsed)) return parsed;
		if (Array.isArray(parsed.logs)) return parsed.logs;
		if (Array.isArray(parsed.data)) return parsed.data;
		return [parsed];
	} catch {
		return trimmed
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
			.map((line) => {
				try {
					return JSON.parse(line);
				} catch {
					return { message: line };
				}
			});
	}
}

async function runRailwayLogs({ service, environment, since }) {
	const localRailwayBin = path.resolve(process.cwd(), 'node_modules', '.bin', 'railway');
	let railwayCommand = 'railway';

	try {
		await fs.access(localRailwayBin);
		railwayCommand = localRailwayBin;
	} catch {
		railwayCommand = 'railway';
	}

	const args = ['logs', '--json'];
	if (service) args.push('--service', service);
	if (environment) args.push('--environment', environment);
	if (since) args.push('--since', since);

	return await new Promise((resolve, reject) => {
		const child = spawn(railwayCommand, args, {
			stdio: ['ignore', 'pipe', 'pipe'],
			env: process.env,
		});

		let stdout = '';
		let stderr = '';

		child.stdout.on('data', (chunk) => {
			stdout += chunk.toString();
		});

		child.stderr.on('data', (chunk) => {
			stderr += chunk.toString();
		});

		child.on('error', (error) => {
			reject(
				new Error(
					`Nu am putut porni Railway CLI. Instaleaza-l si autentifica-l mai intai. Detaliu: ${error.message}`,
				),
			);
		});

		child.on('close', (code) => {
			if (code !== 0) {
				reject(
					new Error(
						`Railway CLI a iesit cu codul ${code}.\n${stderr.trim() || 'Fara stderr disponibil.'}`,
					),
				);
				return;
			}

			resolve(stdout);
		});
	});
}

function buildDefaultOutputPath(baseDir) {
	const now = new Date();
	const dateStamp = now.toISOString().slice(0, 10);
	return path.join(baseDir, `railway-logs-${dateStamp}.csv`);
}

async function ensureDirForFile(filePath) {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const service = args.service ?? process.env.RAILWAY_SERVICE ?? '';
	const environment = args.environment ?? process.env.RAILWAY_ENVIRONMENT ?? '';
	const since = args.since ?? process.env.RAILWAY_LOOKBACK ?? '1d';
	const outputDir = process.env.OUTPUT_DIR
		? path.resolve(process.cwd(), process.env.OUTPUT_DIR)
		: path.resolve(process.cwd(), 'out');
	const outputPath = args.output
		? path.resolve(process.cwd(), args.output)
		: buildDefaultOutputPath(outputDir);

	let rawPayload = '';

	if (args.input) {
		rawPayload = await fs.readFile(path.resolve(process.cwd(), args.input), 'utf8');
	} else {
		rawPayload = await runRailwayLogs({ service, environment, since });
	}

	const parsedLogs = parseLogPayload(rawPayload);
	const normalizedRows = parsedLogs.map((entry) => normalizeLogEntry(entry, { service, environment }));
	const headers = ['timestamp', 'service', 'environment', 'level', 'message', 'deployment_id', 'source', 'raw_json'];

	const csvLines = [
		headers.join(','),
		...normalizedRows.map((row) => headers.map((header) => csvEscape(row[header])).join(',')),
	];

	await ensureDirForFile(outputPath);
	await fs.writeFile(outputPath, `${csvLines.join('\n')}\n`, 'utf8');

	console.log(`CSV generat: ${outputPath}`);
	console.log(`Linii exportate: ${normalizedRows.length}`);
}

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
