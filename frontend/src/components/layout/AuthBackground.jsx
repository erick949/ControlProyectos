export default function AuthBackground({ children, maxWidth = 'max-w-[380px]' }) {
  return (
    <div className="min-h-screen w-full bg-academic-dark flex items-center justify-center px-4 py-10">
      <div className={`relative z-10 w-full ${maxWidth}`}>{children}</div>
    </div>
  )
}
