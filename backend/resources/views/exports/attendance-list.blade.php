<!DOCTYPE html>
<html lang="{{ $locale }}">
<head>
    <meta charset="UTF-8">
    <title>{{ $labels['title'] }}</title>
    <style>
        @page {
            margin: 24px 28px;
        }

        body {
            font-family: "DejaVu Sans", sans-serif;
            color: #172033;
            font-size: 10px;
            line-height: 1.35;
        }

        h1 {
            margin: 0 0 8px;
            font-size: 20px;
            font-weight: 700;
        }

        .meta,
        .summary {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .meta td,
        .summary td {
            padding: 4px 6px;
            border: 1px solid #d9e0ea;
            vertical-align: top;
        }

        .meta .label,
        .summary .label {
            width: 16%;
            color: #465568;
            font-weight: 700;
            background: #f3f6f9;
        }

        .section-title {
            margin: 10px 0 6px;
            font-size: 12px;
            font-weight: 700;
            color: #172033;
        }

        .participants {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        .participants th,
        .participants td {
            border: 1px solid #cfd8e3;
            padding: 5px 6px;
            vertical-align: top;
            overflow-wrap: break-word;
            word-wrap: break-word;
        }

        .participants th {
            background: #172033;
            color: #ffffff;
            font-size: 9px;
            font-weight: 700;
            text-align: left;
        }

        .participants tr:nth-child(even) td {
            background: #f8fafc;
        }

        .col-position {
            width: 4%;
            text-align: center;
        }

        .col-status {
            width: 12%;
        }

        .col-attendance {
            width: 11%;
        }

        .col-name {
            width: 17%;
        }

        .col-email {
            width: 22%;
        }

        .col-date {
            width: 12%;
        }

        .col-certificate {
            width: 10%;
        }
    </style>
</head>
<body>
    <h1>{{ $labels['title'] }}</h1>

    <table class="meta">
        <tr>
            <td class="label">{{ $labels['workshop'] }}</td>
            <td>{{ $title }}</td>
            <td class="label">{{ $labels['date'] }}</td>
            <td>{{ $workshopDate }}</td>
        </tr>
        <tr>
            <td class="label">{{ $labels['location'] }}</td>
            <td>{{ $location }}</td>
            <td class="label">{{ $labels['teacher'] }}</td>
            <td>{{ $teacher }}</td>
        </tr>
        <tr>
            <td class="label">{{ $labels['generatedAt'] }}</td>
            <td colspan="3">{{ $generatedAt }}</td>
        </tr>
    </table>

    <div class="section-title">{{ $labels['summary'] }}</div>
    <table class="summary">
        <tr>
            @foreach ($summary as $label => $value)
                <td class="label">{{ $label }}</td>
                <td>{{ $value }}</td>
            @endforeach
        </tr>
    </table>

    <div class="section-title">{{ $labels['participants'] }}</div>
    <table class="participants">
        <thead>
            <tr>
                <th class="col-position">{{ $tableHeaders[0] }}</th>
                <th class="col-status">{{ $tableHeaders[1] }}</th>
                <th class="col-attendance">{{ $tableHeaders[2] }}</th>
                <th class="col-name">{{ $tableHeaders[3] }}</th>
                <th class="col-email">{{ $tableHeaders[4] }}</th>
                <th class="col-date">{{ $tableHeaders[5] }}</th>
                <th class="col-date">{{ $tableHeaders[6] }}</th>
                <th class="col-certificate">{{ $tableHeaders[7] }}</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td class="col-position">{{ $row['position'] }}</td>
                    <td class="col-status">{{ $row['status'] }}</td>
                    <td class="col-attendance">{{ $row['attendance'] }}</td>
                    <td class="col-name">{{ $row['participant_name'] }}</td>
                    <td class="col-email">{{ $row['participant_email'] }}</td>
                    <td class="col-date">{{ $row['registered_at'] }}</td>
                    <td class="col-date">{{ $row['attendance_confirmed_at'] }}</td>
                    <td class="col-certificate">{{ $row['certificate_available'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
