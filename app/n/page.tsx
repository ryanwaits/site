export default function NotesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif mb-8">Notes</h1>
      <div className="space-y-4">
        <a href="/n/2000-to-100" className="block hover:text-[#5a9848]">From 2000 Lines to 100</a>
        <a href="/n/features-dont-compose" className="block hover:text-[#5a9848]">Features Don't Compose</a>
        <a href="/n/new-standard-who-dis" className="block hover:text-[#5a9848]">New Standard, Who Dis?</a>
        <a href="/n/json-schema-contract" className="block hover:text-[#5a9848]">Pick a Standard, Extend Carefully</a>
        <a href="/n/codecov-but-for-docs" className="block hover:text-[#5a9848]">Codecov, But for Docs</a>
        <a href="/n/how-does-this-not-exist" className="block hover:text-[#5a9848]">How Does This Not Exist?</a>
      </div>
    </div>
  )
}
