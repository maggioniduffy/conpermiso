import Form from "next/form";
import { Search } from "lucide-react";
import SearchFormReset from "./SearchFormReset";

interface Props {
  query?: string;
}
const SearchForm = ({ query }: Props) => {
  return (
    <Form
      action={"/"}
      scroll={false}
      id="search-form"
      className="w-full h-full p-2 flex"
    >
      <input
        defaultValue={query}
        name="query"
        placeholder="Buscar..."
        className="h-full w-full p-1 rounded-md"
      />
      <div className="flex gap-2">
        {query ? (
          <SearchFormReset />
        ) : (
          <button type="submit" className="text-jet">
            <Search className="size-5" />
          </button>
        )}
      </div>
    </Form>
  );
};

export default SearchForm;
