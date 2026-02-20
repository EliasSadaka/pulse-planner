import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function SearchFilters({
  params,
}: {
  params: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
      <Input name="q" placeholder="Search title, description, location" defaultValue={params.q} className="md:col-span-2" />
      <Input name="from" type="date" defaultValue={params.from} />
      <Input name="to" type="date" defaultValue={params.to} />
      <Input name="location" placeholder="Location" defaultValue={params.location} />
      <Select name="scope" defaultValue={params.scope ?? "all"}>
        <option value="all">All events</option>
        <option value="my">My events</option>
        <option value="invited">Invited</option>
        <option value="going">Going</option>
        <option value="maybe">Maybe</option>
        <option value="declined">Declined</option>
      </Select>
      <Select name="sort" defaultValue={params.sort ?? "nearest"}>
        <option value="nearest">Nearest date</option>
        <option value="latest">Latest first</option>
      </Select>
      <div className="md:col-span-6">
        <Button type="submit">Apply filters</Button>
      </div>
    </form>
  );
}
