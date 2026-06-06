<?php

namespace Tests\Unit;

use App\Support\SimplePdf;
use PHPUnit\Framework\TestCase;

class SimplePdfTest extends TestCase
{
    public function test_builds_pdf_document_with_xref_table_and_escaped_text(): void
    {
        $pdf = SimplePdf::fromLines(['Certificate (draft)', 'Path \\ example']);

        $this->assertStringStartsWith('%PDF-1.4', $pdf);
        $this->assertStringContainsString('xref', $pdf);
        $this->assertStringContainsString('startxref', $pdf);
        $this->assertStringContainsString('Certificate \(draft\)', $pdf);
        $this->assertStringContainsString('Path \\\\ example', $pdf);
    }
}
