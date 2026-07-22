"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, KeyRound, LogIn, LogOut, MessageSquare, Package, Shield, TicketPercent, UserPlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import styles from "@/ui/shop/surface.module.css";

type UserMenuProps = {
	locale: string;
	initialUser?: AuthUser | null;
};

type AuthUser = {
	id: string;
	name: string;
	email: string;
	role: "ADMIN" | "EDITOR" | "CUSTOMER";
};

export function UserMenu({ locale, initialUser = null }: UserMenuProps) {
	const labels = {
		login: "Giriş Yap",
		account: "Hesabım",
		adminPanel: "Admin Paneli",
		orders: "Siparişlerim",
		coupons: "İndirim Kuponlarım",
		messages: "Mesajlarım",
		changePassword: "Şifreyi Değiştir",
		changePasswordTitle: "Şifreyi değiştir",
		currentPassword: "Mevcut şifre",
		newPassword: "Yeni şifre",
		confirmPassword: "Yeni şifre tekrar",
		cancel: "İptal",
		save: "Kaydet",
		success: "Şifren güncellendi.",
		required: "Tüm şifre alanlarını doldurun.",
		mismatch: "Yeni şifre alanları eşleşmiyor.",
		minLength: "Yeni şifre en az 8 karakter olmalı.",
		currentInvalid: "Mevcut şifre hatalı.",
		reuseBlocked: "Yeni şifre mevcut şifreyle aynı olamaz.",
		operationFailed: "Şifre değiştirilemedi.",
		logout: "Çıkış Yap",
		loginMenu: "Giriş Yap",
		registerMenu: "Kayıt Ol",
	};

	const [open, setOpen] = useState(false);
	const [passwordModalOpen, setPasswordModalOpen] = useState(false);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
	const [passwordLoading, setPasswordLoading] = useState(false);
	const rootRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const onOutsidePointer = (event: MouseEvent) => {
			if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};

		window.addEventListener("mousedown", onOutsidePointer);

		return () => {
			window.removeEventListener("mousedown", onOutsidePointer);
		};
	}, []);

	async function logout() {
		await fetch("/api/identity/logout", { method: "POST" });
		window.location.href = `/${locale}`;
	}

	function resetPasswordForm() {
		setCurrentPassword("");
		setNewPassword("");
		setConfirmPassword("");
		setPasswordError(null);
		setPasswordSuccess(null);
	}

	function openPasswordModal() {
		setOpen(false);
		resetPasswordForm();
		setPasswordModalOpen(true);
	}

	function closePasswordModal() {
		if (passwordLoading) {
			return;
		}

		setPasswordModalOpen(false);
		resetPasswordForm();
	}

	async function submitPasswordChange(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setPasswordError(null);
		setPasswordSuccess(null);

		if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
			setPasswordError(labels.required);
			return;
		}

		if (newPassword.length < 8) {
			setPasswordError(labels.minLength);
			return;
		}

		if (newPassword !== confirmPassword) {
			setPasswordError(labels.mismatch);
			return;
		}

		setPasswordLoading(true);
		try {
			const response = await fetch("/api/identity/change-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					currentPassword,
					newPassword,
				}),
			});

			if (!response.ok) {
				const payload = (await response.json().catch(() => null)) as { message?: string } | null;
				if (payload?.message === "Current password invalid") {
					setPasswordError(labels.currentInvalid);
					return;
				}

				if (payload?.message === "Password reuse not allowed") {
					setPasswordError(labels.reuseBlocked);
					return;
				}

				setPasswordError(labels.operationFailed);
				return;
			}

			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			setPasswordSuccess(labels.success);
		} catch {
			setPasswordError(labels.operationFailed);
		} finally {
			setPasswordLoading(false);
		}
	}

	if (!initialUser) {
		return (
			<div className="relative" ref={rootRef}>
				<Button
					type="button"
					size="sm"
					variant="ghost"
					onClick={() => setOpen((prev) => !prev)}
					className="inline-flex items-center gap-1"
				>
					{labels.login}
					<ChevronDown className="h-4 w-4" />
				</Button>

				{open ? (
					<div className={`${styles.panelSoft} absolute right-0 top-full z-40 mt-1 w-56 p-2 shadow-xl`}>
						<Link href={`/${locale}/login`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<LogIn className="h-4 w-4" />
							{labels.loginMenu}
						</Link>
						<Link href={`/${locale}/register`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<UserPlus className="h-4 w-4" />
							{labels.registerMenu}
						</Link>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="relative" ref={rootRef}>
			<Button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				variant="ghost"
				className="h-9 items-center gap-1 px-3 text-sm font-medium text-neutral-700 hover:bg-neutral-100 hover:text-black"
			>
				<span className="max-w-[140px] truncate">{initialUser.name || labels.account}</span>
				<ChevronDown className="h-4 w-4" />
			</Button>

			{open ? (
				<div className={`${styles.panelSoft} absolute right-0 top-full z-40 mt-1 w-56 p-2 shadow-xl`}>
					{initialUser.role === "ADMIN" ? (
						<Link href={`/${locale}/admin`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
							<Shield className="h-4 w-4" />
							{labels.adminPanel}
						</Link>
					) : null}
					<Link href={`/${locale}/account/orders`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<Package className="h-4 w-4" />
						{labels.orders}
					</Link>
					<Link href={`/${locale}/account/coupons`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<TicketPercent className="h-4 w-4" />
						{labels.coupons}
					</Link>
					<Link href={`/${locale}/account/messages`} className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100" onClick={() => setOpen(false)}>
						<MessageSquare className="h-4 w-4" />
						{labels.messages}
					</Link>
					<Button type="button" onClick={openPasswordModal} variant="ghost" className="mt-1 w-full justify-start gap-2 px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100">
						<KeyRound className="h-4 w-4" />
						{labels.changePassword}
					</Button>
					<Button type="button" onClick={logout} variant="ghost" className="mt-1 w-full justify-start gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
						<LogOut className="h-4 w-4" />
						{labels.logout}
					</Button>
				</div>
			) : null}

			{passwordModalOpen ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
					<div className={`${styles.panelSoft} w-full max-w-md p-5 shadow-2xl`}>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">Hesap güvenliği</p>
								<h2 className="mt-1 text-xl font-semibold text-neutral-950">{labels.changePasswordTitle}</h2>
							</div>
							<Button type="button" size="icon" variant="ghost" onClick={closePasswordModal} disabled={passwordLoading}>
								<X className="h-5 w-5" />
							</Button>
						</div>

						<form className="mt-5 grid gap-4" onSubmit={submitPasswordChange}>
							{passwordError ? <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{passwordError}</p> : null}
							{passwordSuccess ? <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700">{passwordSuccess}</p> : null}
							<label className="grid gap-2 text-sm font-medium text-neutral-800">
								{labels.currentPassword}
								<input className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-900" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
							</label>
							<label className="grid gap-2 text-sm font-medium text-neutral-800">
								{labels.newPassword}
								<input className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-900" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
							</label>
							<label className="grid gap-2 text-sm font-medium text-neutral-800">
								{labels.confirmPassword}
								<input className="h-11 rounded-xl border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-900" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
							</label>
							<div className="mt-2 flex justify-end gap-2 border-t border-neutral-200 pt-4">
								<Button type="button" variant="secondary" onClick={closePasswordModal} disabled={passwordLoading}>{labels.cancel}</Button>
								<Button type="submit" disabled={passwordLoading}>{passwordLoading ? "Kaydediliyor..." : labels.save}</Button>
							</div>
						</form>
					</div>
				</div>
			) : null}
		</div>
	);
}
