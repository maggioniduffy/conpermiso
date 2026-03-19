// components/SearchForm.tsx
import Form from "next/form";
import { Search } from "lucide-react";
import SearchFormReset from "./SearchFormReset";

interface Props {
  query?: string;
}

const SearchForm = ({ query }: Props) => {
  return (
    <Form
      action="/"
      scroll={false}
      id="search-form"
      className="flex items-center gap-2 flex-1 h-9"
    >
      <div className="flex items-center gap-2 flex-1 bg-mywhite rounded-xl px-3 h-full border border-gray-200 focus-within:border-principal transition-colors">
        <Search className="size-4 text-jet-800 shrink-0" />
        <input
          defaultValue={query}
          name="query"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm text-jet placeholder:text-jet-800 outline-none h-full"
        />
        {query && <SearchFormReset />}
      </div>
    </Form>
  );
};

export default SearchForm;
