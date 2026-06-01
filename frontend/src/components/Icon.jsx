const paths = {
  account_circle: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 14a8 8 0 0 1-5.3-2 6 6 0 0 1 10.6 0 8 8 0 0 1-5.3 2Z" />,
  add: <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />,
  add_box: <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm6 4v4H7v2h4v4h2v-4h4v-2h-4V7h-2Z" />,
  add_circle: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2Z" />,
  analytics: <path d="M4 19V5h2v14H4Zm7 0V9h2v10h-2Zm7 0V3h2v16h-2ZM3 21h18v1H3v-1Z" />,
  architecture: <path d="m4 19 6-16 3 8 3-3 4 11h-3l-1-3H8l-1 3H4Zm5-5h6l-2-6-1.7 4.5L10 9l-1 5Z" />,
  arrow_upward: <path d="m12 4 7 7-1.4 1.4L13 7.8V20h-2V7.8l-4.6 4.6L5 11l7-7Z" />,
  arrow_back: <path d="m10 19-7-7 7-7 1.4 1.4L6.8 11H21v2H6.8l4.6 4.6L10 19Z" />,
  arrow_forward: <path d="m14 19-1.4-1.4 4.6-4.6H3v-2h14.2l-4.6-4.6L14 5l7 7-7 7Z" />,
  bar_chart: <path d="M5 19V9h3v10H5Zm5.5 0V5h3v14h-3Zm5.5 0v-7h3v7h-3ZM3 21h18v1H3v-1Z" />,
  biotech: <path d="M7 3h10v2h-1v4.1l4.7 8.1A3.2 3.2 0 0 1 18 22H6a3.2 3.2 0 0 1-2.7-4.8L8 9.1V5H7V3Zm3 6.6-4.9 8.5A1.2 1.2 0 0 0 6 20h12a1.2 1.2 0 0 0 1-1.9l-5-8.5V5h-4v4.6ZM8 17h8v2H8v-2Z" />,
  calendar_today: <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm13 8H4v10h16V10ZM6 7v1h12V7H6Z" />,
  card_membership: <path d="M4 4h16v10H4V4Zm2 2v6h12V6H6Zm2 10h8l-4 5-4-5Z" />,
  check_circle: <path d="M12 2a10 10 0 1 0 .1 0H12Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7Z" />,
  chat: <path d="M4 4h16v12H7l-4 4V5a1 1 0 0 1 1-1Zm3 5h10V7H7v2Zm0 4h7v-2H7v2Z" />,
  chevron_left: <path d="m15.4 19.4-7.4-7.4 7.4-7.4L16.8 6l-6 6 6 6-1.4 1.4Z" />,
  chevron_right: <path d="m8.6 19.4-1.4-1.4 6-6-6-6 1.4-1.4 7.4 7.4-7.4 7.4Z" />,
  close: <path d="m6.4 19-1.4-1.4 5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19Z" />,
  dashboard: <path d="M3 13h8V3H3v10Zm10 8h8V11h-8v10ZM3 21h8v-6H3v6Zm10-12h8V3h-8v6Z" />,
  date_range: <path d="M7 2h2v3h6V2h2v3h3v17H4V5h3V2Zm13 8H4v10h16V10ZM7 13h3v3H7v-3Zm5 0h3v3h-3v-3Z" />,
  download: <path d="M11 3h2v10l3.5-3.5 1.4 1.4L12 16.8l-5.9-5.9 1.4-1.4L11 13V3ZM5 19h14v2H5v-2Z" />,
  east: <path d="m14 18-1.4-1.4 3.6-3.6H4v-2h12.2l-3.6-3.6L14 6l6 6-6 6Z" />,
  edit: <path d="M4 17.5V21h3.5L18.1 10.4l-3.5-3.5L4 17.5ZM19.2 9.3l1.4-1.4a1.5 1.5 0 0 0 0-2.1l-2.4-2.4a1.5 1.5 0 0 0-2.1 0l-1.4 1.4 4.5 4.5Z" />,
  expand_more: <path d="M12 15.5 5 8.5 6.4 7l5.6 5.6L17.6 7 19 8.5l-7 7Z" />,
  filter_list: <path d="M4 6h16v2H4V6Zm3 5h10v2H7v-2Zm3 5h4v2h-4v-2Z" />,
  format_quote: <path d="M7 17h4V9H8.5L10 6H7L5 10v7h2Zm8 0h4V9h-2.5L18 6h-3l-2 4v7h2Z" />,
  group: <path d="M16 11a3 3 0 1 0-2.8-4A4 4 0 0 1 13 8a4 4 0 0 1-1.5 3H16Zm-8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-3.3 0-6 1.7-6 3.8V19h12v-2.2C14 14.7 11.3 13 8 13Zm8 0c-.7 0-1.4.1-2 .3 1.2.9 2 2.1 2 3.5V19h6v-2.2c0-2.1-2.7-3.8-6-3.8Z" />,
  group_add: <path d="M15 12c2.7 0 5 1.4 5 3.2V18h-7v-2.8c0-1.1-.5-2.1-1.4-2.9.9-.2 2.1-.3 3.4-.3ZM8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 2c-3.3 0-6 1.7-6 3.8V19h12v-2.2C14 14.7 11.3 13 8 13Zm10-6V4h-2v3h-3v2h3v3h2V9h3V7h-3Z" />,
  help_outline: <path d="M11 18h2v-2h-2v2Zm1-16a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm0-14a4 4 0 0 0-4 4h2a2 2 0 1 1 3.3 1.5c-1.2 1-2.3 1.8-2.3 3.5h2c0-.8 1.1-1.5 2-2.3A4 4 0 0 0 12 6Z" />,
  history: <path d="M13 3a9 9 0 1 1-8.5 6H2l3.5-3.5L9 9H6.6A7 7 0 1 0 13 5V3Zm-1 4h2v5l4 2-1 1.7-5-3V7Z" />,
  history_edu: <path d="M4 4h13a3 3 0 0 1 3 3v13H6a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Zm2 14h12V7a1 1 0 0 0-1-1H5v11a1 1 0 0 0 1 1Zm2-9h7v2H8V9Zm0 4h5v2H8v-2Z" />,
  horizontal_rule: <path d="M5 11h14v2H5v-2Z" />,
  hourglass_empty: <path d="M6 2h12v6l-4 4 4 4v6H6v-6l4-4-4-4V2Zm2 2v3.2l4 4 4-4V4H8Zm4 8.8-4 4V20h8v-3.2l-4-4Z" />,
  image: <path d="M4 5h16v14H4V5Zm2 2v10h12V7H6Zm2 8 2.5-3 2 2.4L15 11l3 4H8Zm1.5-5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />,
  import_contacts: <path d="M4 5.5A7.5 7.5 0 0 1 11 5v14a7.5 7.5 0 0 0-7 .5v-14Zm9-.5a7.5 7.5 0 0 1 7 .5v14a7.5 7.5 0 0 0-7-.5V5Z" />,
  insights: <path d="M4 19h16v2H4v-2Zm1-3 4-4 3 3 6-7 1.5 1.3-7.4 8.7-3.1-3.1-2.6 2.6L5 16Zm0-7 4-4 3 3 4-5 1.5 1.3-5.4 6.2L9 7.4 6.4 10 5 9Z" />,
  hub: <path d="M12 3a3 3 0 0 1 2 5.2l2.6 4.5a3 3 0 1 1-1.7 1l-2.7-4.6h-.4l-2.7 4.6a3 3 0 1 1-1.7-1L10 8.2A3 3 0 0 1 12 3Zm0 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM6 16a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm12 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />,
  location_on: <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />,
  link: <path d="M7.5 13.5 6.1 12l-2.2 2.2a3 3 0 0 0 4.2 4.2l3.6-3.6a3 3 0 0 0 0-4.2l1.4-1.4a5 5 0 0 1 0 7l-3.6 3.6a5 5 0 0 1-7-7l2.2-2.2 2.8 2.9Zm2-2 5-5a3 3 0 0 1 4.2 4.2l-2.2 2.2-1.4-1.4 2.2-2.2a1 1 0 0 0-1.4-1.4l-5 5a1 1 0 0 0 0 1.4l-1.4 1.4a3 3 0 0 1 0-4.2Z" />,
  monitoring: <path d="M4 19V5h16v14H4Zm2-2h12V7H6v10Zm1-2 3.5-3.5 2 2L17 9l1.2 1.2-5.7 5.7-2-2L8.2 16 7 15Z" />,
  notifications: <path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22Zm7-5-2-2v-5a5 5 0 0 0-4-4.9V3h-2v2.1A5 5 0 0 0 7 10v5l-2 2v1h14v-1Z" />,
  payments: <path d="M3 6h18v12H3V6Zm2 3v6h14V9H5Zm2 2h5v2H7v-2Zm9-1a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z" />,
  person: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-8 2-8 4.5V21h16v-2.5C20 16 16 14 12 14Z" />,
  psychology: <path d="M9 21v-3H7a3 3 0 0 1-3-3v-3a7 7 0 1 1 14 0v1h2v4h-2v4h-5v-2h3v-4h2v-1h-2v-2a5 5 0 1 0-10 0v3a1 1 0 0 0 1 1h4v5H9Z" />,
  palette: <path d="M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a1.5 1.5 0 0 1 0-3h2a7 7 0 0 0-2-10ZM7.5 10A1.5 1.5 0 1 1 7.5 7a1.5 1.5 0 0 1 0 3Zm3-3A1.5 1.5 0 1 1 10.5 4a1.5 1.5 0 0 1 0 3Zm4 1A1.5 1.5 0 1 1 14.5 5a1.5 1.5 0 0 1 0 3ZM6 14a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />,
  schedule: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm1-13h-2v6l5 3 1-1.7-4-2.3V7Z" />,
  school: <path d="m12 3 10 5-10 5L2 8l10-5Zm-6 9.2 6 3 6-3V17c-1.6 1.5-3.6 2.2-6 2.2S7.6 18.5 6 17v-4.8Z" />,
  search: <path d="m19.6 21-6.3-6.3a6.5 6.5 0 1 1 1.4-1.4l6.3 6.3-1.4 1.4ZM9.5 14a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />,
  sort: <path d="M4 7h12v2H4V7Zm0 4h9v2H4v-2Zm0 4h6v2H4v-2Zm14-8 3 3h-6l3-3Zm0 10-3-3h6l-3 3Z" />,
  star: <path d="m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.5L12 17.5l-5.8 3.1 1.1-6.5-4.8-4.6 6.6-1L12 2.5Z" />,
  support_agent: <path d="M12 3a8 8 0 0 0-8 8v4a3 3 0 0 0 3 3h1v-7H6a6 6 0 0 1 12 0h-2v7h1.2A5.2 5.2 0 0 1 12 21h-2v-2h2a3.2 3.2 0 0 0 3.2-3.2V11a3.2 3.2 0 0 0-6.4 0v5H7a1 1 0 0 1-1-1v-4a6 6 0 0 1 12 0v4a1 1 0 0 1-1 1h-1.8A5.2 5.2 0 0 1 12 21h2v-2h-2a3.2 3.2 0 0 1-3.2-3.2V11a3.2 3.2 0 0 1 6.4 0v5H16v-5a4 4 0 0 0-8 0v7H7a3 3 0 0 1-3-3v-4a8 8 0 0 1 8-8Z" />,
  task: <path d="M5 3h10l4 4v14H5V3Zm9 1.5V8h3.5L14 4.5ZM8 12l1.4-1.4 1.6 1.6 3.6-3.6L16 10l-5 5-3-3Zm0 5h8v2H8v-2Z" />,
  timer: <path d="M9 2h6v2H9V2Zm2 7h2v5h-2V9Zm1-4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 14a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" />,
  upload: <path d="M11 17h2V7.8l3.6 3.6L18 10l-6-6-6 6 1.4 1.4L11 7.8V17Zm-6 2h14v2H5v-2Z" />,
  verified: <path d="m12 2 2.2 2.1 3-.2.6 2.9 2.6 1.5-1.2 2.7 1.2 2.7-2.6 1.5-.6 2.9-3-.2L12 20l-2.2-2.1-3 .2-.6-2.9-2.6-1.5L4.8 11 3.6 8.3l2.6-1.5.6-2.9 3 .2L12 2Zm-1 12.5 5.2-5.2-1.4-1.4-3.8 3.8-1.8-1.8-1.4 1.4 3.2 3.2Z" />,
  videocam: <path d="M4 6h11a2 2 0 0 1 2 2v1.5L21 7v10l-4-2.5V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Zm0 2v8h11V8H4Z" />,
  west: <path d="m10 18-6-6 6-6 1.4 1.4L7.8 11H20v2H7.8l3.6 3.6L10 18Z" />,
  workspace_premium: <path d="M12 2 4 5v6c0 4.9 3.4 9.5 8 10.8 4.6-1.3 8-5.9 8-10.8V5l-8-3Zm0 2.2 6 2.2V11c0 3.7-2.4 7.3-6 8.6-3.6-1.3-6-4.9-6-8.6V6.4l6-2.2Zm0 3.3 1.3 2.7 3 .4-2.1 2.1.5 3-2.7-1.4-2.7 1.4.5-3-2.1-2.1 3-.4L12 7.5Z" />,
}

export default function Icon({ children, filled = false, className = '' }) {
  const name = String(children).trim()
  const path = paths[name] ?? paths.help_outline

  return (
    <svg
      aria-hidden="true"
      className={`inline-block shrink-0 align-middle ${className}`}
      fill="currentColor"
      focusable="false"
      role="img"
      style={{ fontSize: 'inherit', height: '1em', width: '1em', ...(filled ? {} : null) }}
      viewBox="0 0 24 24"
    >
      {path}
    </svg>
  )
}
