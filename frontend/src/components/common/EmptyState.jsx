import { StatePanel } from './StatePanel'

function CheckIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

/**
 * @param {object} props
 * @param {string} [props.title]
 * @param {React.ReactNode} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {React.ReactNode} [props.icon]
 */
export function EmptyState({
  title = 'Nothing here yet',
  description,
  action,
  icon = <CheckIcon />,
}) {
  return <StatePanel icon={icon} title={title} description={description} action={action} />
}
