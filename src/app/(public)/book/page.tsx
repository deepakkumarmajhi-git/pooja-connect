"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type CatalogItem = {
    _id: string;
    slug: string;
    title?: string;
    name?: string;
    startingFrom?: number;
    isActive?: boolean;
};

type PriestDetailsResponse = {
    success?: boolean;
    ok?: boolean;
    priest?: any;
    services?: any[];
    message?: string;
    error?: string;
};

export default function BookPage() {
    const router = useRouter();
    const sp = useSearchParams();
    const priestId = sp.get("priestId") || "";

    // Loading states
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    // Data
    const [catalog, setCatalog] = useState<CatalogItem[]>([]);
    const [details, setDetails] = useState<PriestDetailsResponse | null>(null);

    // Form
    const [mode, setMode] = useState<"HOME" | "ONLINE">("HOME");
    const [catalogSlug, setCatalogSlug] = useState("");
    const [priestServiceId, setPriestServiceId] = useState("");

    const [date, setDate] = useState(""); // yyyy-mm-dd
    const [time, setTime] = useState(""); // hh:mm

    const [city, setCity] = useState("Bhubaneswar");
    const [area, setArea] = useState("");
    const [fullAddress, setFullAddress] = useState("");
    const [notes, setNotes] = useState("");

    // Add-ons
    const [extraHavan, setExtraHavan] = useState(false);
    const [samagriIncluded, setSamagriIncluded] = useState(false);
    const [assistant, setAssistant] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [distanceKm, setDistanceKm] = useState<number>(0);

    // Helpers
    const selectedCatalog = useMemo(
        () => catalog.find((c) => c.slug === catalogSlug),
        [catalog, catalogSlug]
    );

    const allServices = useMemo(() => details?.services ?? [], [details]);

    // Filter priest services by selected catalog (handles both catalogId or catalogSlug if present)
    const filteredServices = useMemo(() => {
        if (!catalogSlug) return [];
        const catalogId = selectedCatalog?._id;

        return allServices.filter((s: any) => {
            const sid = s?.catalogId ? String(s.catalogId) : "";
            const sslug = s?.catalogSlug ? String(s.catalogSlug) : "";
            if (catalogId && sid) return sid === String(catalogId);
            if (sslug) return sslug.toLowerCase() === catalogSlug.toLowerCase();
            // fallback: allow showing all if we can't match
            return true;
        });
    }, [allServices, catalogSlug, selectedCatalog]);

    // Initial load: catalog + priest details
    useEffect(() => {
        async function load() {
            try {
                setLoading(true);
                setError("");

                if (!priestId) {
                    setError("Missing priestId in URL. Open booking from a priest listing.");
                    return;
                }

                // 1) load catalog
                const cRes = await fetch("/api/catalog", { cache: "no-store" });
                const cJson = await cRes.json();

                // Accept common response shapes:
                // { ok:true, items:[...] } OR { success:true, catalog:[...] } OR [...]
                const catalogItems: CatalogItem[] =
                    Array.isArray(cJson) ? cJson : cJson.items ?? cJson.catalog ?? [];

                // Keep only active if the list contains that flag
                const activeCatalog = catalogItems.filter((x) =>
                    typeof x.isActive === "boolean" ? x.isActive : true
                );

                setCatalog(activeCatalog);

                // Default choose first catalog
                if (activeCatalog.length && !catalogSlug) {
                    setCatalogSlug(activeCatalog[0].slug);
                }

                // 2) load priest + services
                const pRes = await fetch(`/api/priests/${priestId}`, { cache: "no-store" });
                const pJson = (await pRes.json()) as PriestDetailsResponse;

                if (!pRes.ok || (!pJson.success && !pJson.ok)) {
                    setError(pJson.message || pJson.error || "Failed to load priest details");
                    return;
                }

                setDetails(pJson);
            } catch (e: any) {
                setError(e?.message || "Something went wrong while loading");
            } finally {
                setLoading(false);
            }
        }

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [priestId]);

    // When catalog selection changes, set default service from filtered list
    useEffect(() => {
        if (!catalogSlug) return;
        if (filteredServices.length) {
            setPriestServiceId(String(filteredServices[0]._id));
        } else {
            setPriestServiceId("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [catalogSlug, filteredServices.length]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!priestId) return setError("Missing priestId");
        if (!catalogSlug) return setError("Please select a Puja");
        if (!priestServiceId) return setError("No service available for this Puja + Priest");
        if (!date || !time) return setError("Please select date and time");
        if (!fullAddress.trim()) return setError("Please enter full address");

        const scheduledAt = new Date(`${date}T${time}:00`).toISOString();

        const payload = {
            bookingType: "PICK_PRIEST",
            mode,
            catalogSlug,
            scheduledAt,

            // address
            city,
            area,
            fullAddress,

            // optional
            notes,

            // required for PICK_PRIEST
            priestServiceId,

            // add-ons (your buildAddons reads these)
            extraHavan,
            samagriIncluded,
            assistant,
            streaming,
            distanceKm: mode === "HOME" ? Number(distanceKm || 0) : 0,
        };

        try {
            setPosting(true);

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok || data?.ok === false) {
                setError(data?.error || data?.message || "Booking failed");
                return;
            }

            const bookingId = data?.bookingId;
            if (bookingId) {
                router.push(`/bookings/${bookingId}`);
            } else {
                router.push("/bookings");
            }
        } catch (e: any) {
            setError(e?.message || "Booking failed");
        } finally {
            setPosting(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <p className="text-sm text-muted-foreground">Loading booking form...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="text-xl font-semibold">Book a Priest</h1>
                <p className="mt-3 rounded-lg border p-3 text-sm">{error}</p>
                <button
                    className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
                    onClick={() => window.location.reload()}
                >
                    Retry
                </button>
            </div>
        );
    }

    const priestName = details?.priest?.user?.name ?? "Priest";

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="text-2xl font-bold">Book a Priest</h1>
            <p className="mt-1 text-sm text-muted-foreground">
                Booking with <span className="font-medium text-black">{priestName}</span>
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {/* Mode */}
                <div className="rounded-xl border p-4">
                    <label className="block text-sm font-medium">Mode</label>
                    <div className="mt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setMode("HOME")}
                            className={`rounded-lg border px-3 py-2 text-sm ${mode === "HOME" ? "bg-black text-white" : ""
                                }`}
                        >
                            Home
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("ONLINE")}
                            className={`rounded-lg border px-3 py-2 text-sm ${mode === "ONLINE" ? "bg-black text-white" : ""
                                }`}
                        >
                            Online
                        </button>
                    </div>
                </div>

                {/* Puja */}
                <div className="rounded-xl border p-4">
                    <label className="block text-sm font-medium">Select Puja</label>
                    <select
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        value={catalogSlug}
                        onChange={(e) => setCatalogSlug(e.target.value)}
                    >
                        {catalog.length === 0 ? (
                            <option value="">No pujas available</option>
                        ) : (
                            catalog.map((c) => (
                                <option key={c._id} value={c.slug}>
                                    {c.title ?? c.name ?? c.slug}
                                    {c.startingFrom != null ? ` (from ₹${c.startingFrom})` : ""}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Priest Service (for chosen puja) */}
                <div className="rounded-xl border p-4">
                    <label className="block text-sm font-medium">Select Priest Service</label>
                    <select
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        value={priestServiceId}
                        onChange={(e) => setPriestServiceId(e.target.value)}
                    >
                        {filteredServices.length === 0 ? (
                            <option value="">No service for selected Puja</option>
                        ) : (
                            filteredServices.map((s: any) => (
                                <option key={s._id} value={String(s._id)}>
                                    {s.title ?? s.name ?? "Service"}{" "}
                                    {s.customPrice != null ? `- ₹${s.customPrice}` : ""}
                                </option>
                            ))
                        )}
                    </select>
                    <p className="mt-2 text-xs text-muted-foreground">
                        This maps to your backend field: <code>priestServiceId</code>
                    </p>
                </div>

                {/* Date & Time */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border p-4">
                        <label className="block text-sm font-medium">Date</label>
                        <input
                            type="date"
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <div className="rounded-xl border p-4">
                        <label className="block text-sm font-medium">Time</label>
                        <input
                            type="time"
                            className="mt-2 w-full rounded-lg border px-3 py-2"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                        />
                    </div>
                </div>

                {/* Address */}
                <div className="rounded-xl border p-4">
                    <label className="block text-sm font-medium">City</label>
                    <input
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />

                    <label className="mt-4 block text-sm font-medium">Area</label>
                    <input
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="E.g. Patia"
                    />

                    <label className="mt-4 block text-sm font-medium">Full Address</label>
                    <textarea
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        rows={3}
                        value={fullAddress}
                        onChange={(e) => setFullAddress(e.target.value)}
                        placeholder="House/Flat, Street, Landmark"
                    />
                </div>

                {/* Add-ons */}
                <div className="rounded-xl border p-4">
                    <p className="text-sm font-medium">Add-ons</p>

                    <div className="mt-3 grid gap-2">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={extraHavan} onChange={(e) => setExtraHavan(e.target.checked)} />
                            Extra Havan
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={samagriIncluded}
                                onChange={(e) => setSamagriIncluded(e.target.checked)}
                            />
                            Samagri included
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={assistant} onChange={(e) => setAssistant(e.target.checked)} />
                            Additional priest/assistant
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={streaming} onChange={(e) => setStreaming(e.target.checked)} />
                            Live streaming / recorded video
                        </label>
                    </div>

                    {mode === "HOME" && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium">Distance (km)</label>
                            <input
                                type="number"
                                min={0}
                                className="mt-2 w-full rounded-lg border px-3 py-2"
                                value={distanceKm}
                                onChange={(e) => setDistanceKm(Number(e.target.value))}
                                placeholder="Used to calculate travel fee"
                            />
                            <p className="mt-2 text-xs text-muted-foreground">
                                Your backend charges travel fee if distance &gt; 5km.
                            </p>
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div className="rounded-xl border p-4">
                    <label className="block text-sm font-medium">Notes (optional)</label>
                    <textarea
                        className="mt-2 w-full rounded-lg border px-3 py-2"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions"
                    />
                </div>

                <button
                    type="submit"
                    disabled={posting || filteredServices.length === 0}
                    className="w-full rounded-lg bg-black px-4 py-3 text-white disabled:opacity-60"
                >
                    {posting ? "Creating booking..." : "Confirm Booking"}
                </button>
            </form>
        </div>
    );
}
