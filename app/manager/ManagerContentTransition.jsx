export default function ManagerContentTransition({ children, className = '' }) {
  return <div className={`manager-content-transition ${className}`.trim()}>{children}</div>
}
