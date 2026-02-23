"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiHome, HiUser, HiBriefcase, HiCode, HiMail, HiDesktopComputer } from "react-icons/hi";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export function CommandMenu() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl"
                    >
                        <Command className="w-full bg-transparent text-[var(--text-primary)]">
                            <div className="flex items-center border-b border-[var(--border-color)] px-4" cmdk-input-wrapper="">
                                <Command.Input
                                    placeholder="Ne arıyorsunuz? (Komut yazın...)"
                                    className="w-full bg-transparent py-4 text-base outline-none placeholder:text-[var(--text-tertiary)]"
                                />
                                <kbd className="hidden sm:inline-block rounded bg-[var(--bg-tertiary)] px-2 py-0.5 text-xs text-[var(--text-secondary)] border border-[var(--border-color)]">ESC</kbd>
                            </div>

                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2 scrollbar-hide">
                                <Command.Empty className="p-4 text-center text-[var(--text-secondary)]">Sonuç bulunamadı.</Command.Empty>

                                <Command.Group heading="Sayfalar" className="mb-2 text-xs font-medium text-[var(--text-tertiary)] px-2">
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.location.hash = "#")}
                                    >
                                        <HiHome className="h-5 w-5" />
                                        <span>Ana Sayfa</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.location.hash = "#hakkimda")}
                                    >
                                        <HiUser className="h-5 w-5" />
                                        <span>Hakkımda</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.location.hash = "#deneyim")}
                                    >
                                        <HiBriefcase className="h-5 w-5" />
                                        <span>Deneyim</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.location.hash = "#projeler")}
                                    >
                                        <HiCode className="h-5 w-5" />
                                        <span>Projeler</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="my-1 h-px bg-[var(--border-color)]" />

                                <Command.Group heading="Aksiyonlar" className="mb-2 text-xs font-medium text-[var(--text-tertiary)] px-2">
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => {
                                            setOpen(false);
                                            const link = document.createElement('a');
                                            link.href = '/MEHMET DEMİR CV.pdf';
                                            link.download = 'MEHMET DEMİR CV.pdf';
                                            link.click();
                                        }}
                                    >
                                        <HiDesktopComputer className="h-5 w-5" />
                                        <span>CV İndir</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => {
                                            window.location.href = "mailto:example@example.com"; // User should update this
                                            setOpen(false);
                                        }}
                                    >
                                        <HiMail className="h-5 w-5" />
                                        <span>E-mail Gönder</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="my-1 h-px bg-[var(--border-color)]" />

                                <Command.Group heading="Sosyal Medya" className="mb-2 text-xs font-medium text-[var(--text-tertiary)] px-2">
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.open("https://github.com/mhmtdmr155", "_blank"))}
                                    >
                                        <FaGithub className="h-5 w-5" />
                                        <span>GitHub</span>
                                    </Command.Item>
                                    <Command.Item
                                        className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-3 text-sm text-[var(--text-primary)] aria-selected:bg-[var(--accent-primary)] aria-selected:text-white transition-colors"
                                        onSelect={() => runCommand(() => window.open("https://www.linkedin.com/in/mehmet-demir-35b720207/", "_blank"))}
                                    >
                                        <FaLinkedin className="h-5 w-5" />
                                        <span>LinkedIn</span>
                                    </Command.Item>
                                </Command.Group>

                            </Command.List>
                        </Command>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
