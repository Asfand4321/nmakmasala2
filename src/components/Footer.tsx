export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-taupe/40 mt-12">
      <div className="container-nm py-8 text-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {year} Namak Masaala. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a href="/plans" className="hover:opacity-80">Plans</a>
          <a href="/meals" className="hover:opacity-80">Meals</a>
          <a href="/account" className="hover:opacity-80">Account</a>
        </div>
      </div>
    </footer>
  )
}
