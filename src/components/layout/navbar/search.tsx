"use client";

import { useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import styles from "@/ui/shop/surface.module.css";

type SearchProps = {
	locale: string;
	placeholder: string;
};

export function NavbarSearch({ locale, placeholder }: SearchProps) {
	const searchParams = useSearchParams();
	const query = searchParams.get("q") ?? "";

	return (
		<form action={`/${locale}/search`} className={`${styles.panelSoft} w-full p-1.5`}>
			<Input
				type="search"
				name="q"
				defaultValue={query}
				placeholder={placeholder}
				className="h-11 w-full rounded-[0.95rem] border-transparent bg-white/80 text-sm shadow-none focus:border-transparent focus:ring-2 focus:ring-[color:var(--primary)]/15"
			/>
		</form>
	);
}
