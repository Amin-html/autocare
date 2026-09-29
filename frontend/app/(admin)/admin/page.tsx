import Link from "next/link";

const sections = [
  {
    href: "/admin/users",
    title: "Users",
    description: "View accounts and change roles.",
  },
  {
    href: "/admin/catalog",
    title: "Catalog",
    description: "Services and bays offered by the shop.",
  },
  {
    href: "/dispatcher",
    title: "Dispatch",
    description: "Today's bays and appointment timeline.",
  },
];

export default function AdminHomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="label-uppercase text-medium-gray mb-2">Autocare / Admin</p>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-10">CONTROL CENTER</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border border-dark-gray rounded-md p-6 hover:border-white transition-colors"
          >
            <p className="text-xl font-semibold mb-2">{s.title}</p>
            <p className="text-medium-gray text-sm">{s.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}