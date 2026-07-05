"use client";

import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

type SearchProps = {
	locale: string;
	placeholder: string;
};

export function NavbarSearch({ locale, placeholder }: SearchProps) {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") ?? "";

	return (
		<form action={`/${locale}/search`} className="w-full">
			<Input
				type="search"
				name="q"
				defaultValue={query}
				placeholder={placeholder}
				className="h-11 w-full rounded-xl text-sm"
			/>
		</form>
	);
}
