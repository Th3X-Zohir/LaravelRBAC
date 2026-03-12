import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useObservable } from '@legendapp/state/react';
import { useSelector } from '@legendapp/state/react';
import {
    CalendarPlus,
    DoorOpen,
    LogIn,
    SearchCheck,
    UserPlus,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import useSWR from 'swr';

import { show as loginShow } from '@/actions/App/Http/Controllers/Auth/LoginController';
import { show as registerShow } from '@/actions/App/Http/Controllers/Auth/RegisterController';
import { search } from '@/actions/App/Http/Controllers/RoomController';
import { index as roomsIndex } from '@/actions/App/Http/Controllers/RoomController';
import { store } from '@/actions/App/Http/Controllers/RoomRequestController';
import { ThemeToggle } from '@/components/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { useI18n } from '@/lib/i18n';
import { formatDate, localizeDigits } from '@/lib/utils';
import type { Auth, User } from '@/types';

type Room = {
    id: number;
    room_number: string;
    status: 'available' | 'occupied' | 'maintenance';
    has_pending_request: number;
};

type Slot = {
    start_time: string;
    end_time: string;
    label: string;
};

type RoomRequestForm = {
    room_id: number | null;
    date: string;
    start_time: string;
    end_time: string;
    purpose: string;
};

type SearchResponse = {
    date: string;
    start_time: string;
    end_time: string | null;
    rooms: Room[];
};

function textareaClasses(): string {
    return 'flex min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50';
}

/**
 * Get the today's date in the local timezone.
 * @returns The today's date in the local timezone.
 */
function todayDate(): string {
    const localDate = new Date();
    const offsetDate = new Date(
        localDate.getTime() - localDate.getTimezoneOffset() * 60000,
    );
    return offsetDate.toISOString().slice(0, 10);
}

async function fetchJson<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
    });

    if (!response.ok) {
        throw new Error('rooms.availability_load_error');
    }

    return (await response.json()) as T;
}

function RoomAvailabilityShell({
    user,
    children,
}: {
    user: User | null;
    children: ReactNode;
}) {
    const { t } = useI18n();

    if (user !== null) {
        return <AppLayout>{children}</AppLayout>;
    }

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-sm">
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4 sm:px-6">
                    <Link
                        href={roomsIndex.url()}
                        className="flex items-center gap-2 text-foreground"
                    >
                        <DoorOpen className="size-5" />
                        <span className="text-sm font-semibold tracking-tight">
                            {t('brand.name')}
                        </span>
                    </Link>
                    <div className="ml-auto flex items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="sm"
                            nativeButton={false}
                            render={<Link href={loginShow.url()} />}
                        >
                            <LogIn className="size-3.5" />
                            {t('rooms.sign_in')}
                        </Button>
                        <Button
                            size="sm"
                            nativeButton={false}
                            render={<Link href={registerShow.url()} />}
                        >
                            <UserPlus className="size-3.5" />
                            {t('rooms.register')}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
                {children}
            </main>
        </div>
    );
}

export default function Rooms({ slots }: { slots: Slot[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t, locale } = useI18n();
    const user = auth.user;
    const uiState = useObservable({
        selectedDate: '',
        selectedStartTime: '',
        bookingOpen: false,
        selectedRoom: null as Room | null,
    });

    const selectedDate = useSelector(uiState.selectedDate);
    const selectedStartTime = useSelector(uiState.selectedStartTime);
    const bookingOpen = useSelector(uiState.bookingOpen);
    const selectedRoom = useSelector(uiState.selectedRoom);

    const canRequestRoom =
        user?.roles.includes('cr') === true ||
        user?.permissions.includes('request room') === true;

    const searchKey =
        selectedDate !== '' && selectedStartTime !== ''
            ? search.url({
                  query: {
                      date: selectedDate,
                      start_time: selectedStartTime,
                  },
              })
            : null;

    const { data: searchResponse, isLoading } = useSWR<SearchResponse>(
        searchKey,
        fetchJson,
        {
            revalidateOnFocus: false,
        },
    );

    const availableRooms = searchResponse?.rooms ?? [];
    const selectedSlot =
        slots.find((slot) => slot.start_time === selectedStartTime) ?? null;

    const form = useForm<RoomRequestForm>({
        room_id: null,
        date: '',
        start_time: '',
        end_time: '',
        purpose: '',
    });

    function openBookingDialog(room: Room): void {
        if (selectedDate === '' || selectedSlot === null) {
            return;
        }

        uiState.selectedRoom.set(room);
        form.reset();
        form.clearErrors();
        form.setData('room_id', room.id);
        form.setData('date', selectedDate);
        form.setData('start_time', selectedSlot.start_time);
        form.setData('end_time', selectedSlot.end_time);
        uiState.bookingOpen.set(true);
    }

    function closeBookingDialog(): void {
        uiState.bookingOpen.set(false);
        uiState.selectedRoom.set(null);
        form.reset();
        form.clearErrors();
    }

    function submitRequest(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();

        form.post(store.url(), {
            preserveScroll: true,
            onSuccess: () => {
                closeBookingDialog();
            },
        });
    }

    return (
        <RoomAvailabilityShell user={user}>
            <Head title="Room Availability" />

            <div className="flex flex-col gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Search Available Rooms</CardTitle>
                        <CardDescription>
                            Availability is checked by date first, then by time
                            slot.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="availability-date">Date</Label>
                            <Input
                                id="availability-date"
                                type="date"
                                min={todayDate()}
                                value={selectedDate}
                                onChange={(event) => {
                                    uiState.selectedDate.set(
                                        event.target.value,
                                    );

                                    if (bookingOpen) {
                                        closeBookingDialog();
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="availability-slot">Time slot</Label>
                            <Select
                                value={selectedStartTime}
                                onValueChange={(value) => {
                                    uiState.selectedStartTime.set(value);

                                    if (bookingOpen) {
                                        closeBookingDialog();
                                    }
                                }}
                            >
                                <SelectTrigger
                                    id="availability-slot"
                                    className="w-full"
                                >
                                    <SelectValue
                                        placeholder={t(
                                            'rooms.select_time_slot',
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    {slots.map((slot) => (
                                        <SelectItem
                                            key={slot.start_time}
                                            value={slot.start_time}
                                        >
                                            {slot.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex h-9 items-center gap-2 rounded-lg border border-dashed px-3 text-sm text-muted-foreground">
                            <SearchCheck className="size-4" />
                            {searchKey === null
                                ? t('rooms.search_hint')
                                : isLoading
                                  ? t('rooms.checking_availability')
                                  : t('rooms.rooms_available', {
                                        count: availableRooms.length,
                                    })}
                        </div>
                    </CardContent>
                </Card>

                {searchKey === null ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
                        <SearchCheck className="size-10 text-muted-foreground" />
                        <p className="font-medium">
                            {t('rooms.choose_filters_title')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('rooms.choose_filters_desc')}
                        </p>
                    </div>
                ) : isLoading ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
                        <SearchCheck className="size-10 animate-pulse text-muted-foreground" />
                        <p className="font-medium">
                            {t('rooms.checking_title')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('rooms.checking_desc', {
                                date: formatDate(selectedDate, locale),
                            })}
                        </p>
                    </div>
                ) : availableRooms.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed py-14 text-center">
                        <DoorOpen className="size-10 text-muted-foreground" />
                        <p className="font-medium">
                            {t('rooms.no_rooms_title')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('rooms.no_rooms_desc', {
                                slot:
                                    selectedSlot?.label ?? selectedStartTime,
                                date: formatDate(selectedDate, locale),
                            })}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {availableRooms.map((room) => (
                            <Card key={room.id} className="justify-between">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <CardTitle>
                                                {t('rooms.room_title', {
                                                    room: localizeDigits(
                                                        room.room_number,
                                                        locale,
                                                    ),
                                                })}
                                            </CardTitle>
                                            <CardDescription>
                                                {t('rooms.free_for', {
                                                    slot:
                                                        selectedSlot?.label ??
                                                        selectedStartTime,
                                                })}
                                            </CardDescription>
                                        </div>
                                        <Badge variant="default">
                                            {t('rooms.available_badge')}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-3">
                                    <div className="rounded-lg bg-muted/50 p-3">
                                        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
                                            {t('rooms.booking_window')}
                                        </p>
                                        <p className="mt-1 text-sm">
                                            {formatDate(selectedDate, locale)} ·{' '}
                                            {selectedSlot?.label ??
                                                selectedStartTime}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {t('rooms.pending_requests')}
                                        </span>
                                        <Badge variant="outline">
                                            {room.has_pending_request}
                                        </Badge>
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-between gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {canRequestRoom
                                            ? t('rooms.room_free')
                                            : t('rooms.room_free_sign_in_cta')}
                                    </span>
                                    {canRequestRoom ? (
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                openBookingDialog(room)
                                            }
                                        >
                                            <CalendarPlus className="size-3.5" />
                                            {t('rooms.request_room')}
                                        </Button>
                                    ) : null}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <Dialog
                open={bookingOpen}
                onOpenChange={(open) => {
                    if (open) {
                        uiState.bookingOpen.set(true);

                        return;
                    }

                    closeBookingDialog();
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {t('rooms.request_room_title', {
                                room: selectedRoom?.room_number ?? 'room',
                            })}
                        </DialogTitle>
                        <DialogDescription>
                            {t('rooms.dialog_desc', {
                                date: formatDate(selectedDate, locale),
                                slot: selectedSlot?.label ?? selectedStartTime,
                            })}
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={submitRequest}
                        className="flex flex-col gap-4"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="request-date">
                                    {t('rooms.field_date')}
                                </Label>
                                <Input
                                    id="request-date"
                                    value={formatDate(form.data.date, locale)}
                                    disabled
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="request-room">
                                    {t('rooms.field_room')}
                                </Label>
                                <Input
                                    id="request-room"
                                    value={selectedRoom?.room_number ?? ''}
                                    disabled
                                />
                            </div>
                            <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <Label htmlFor="request-slot">
                                    {t('rooms.field_time_slot')}
                                </Label>
                                <Input
                                    id="request-slot"
                                    value={selectedSlot?.label ?? ''}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="purpose">
                                {t('rooms.field_purpose')}
                            </Label>
                            <textarea
                                id="purpose"
                                value={form.data.purpose}
                                onChange={(event) =>
                                    form.setData('purpose', event.target.value)
                                }
                                placeholder={t('rooms.purpose_placeholder')}
                                className={textareaClasses()}
                            />
                            {form.errors.purpose ? (
                                <p className="text-xs text-destructive">
                                    {form.errors.purpose}
                                </p>
                            ) : null}
                        </div>

                        {form.errors.room_id ? (
                            <p className="text-xs text-destructive">
                                {form.errors.room_id}
                            </p>
                        ) : null}
                        {form.errors.date ? (
                            <p className="text-xs text-destructive">
                                {form.errors.date}
                            </p>
                        ) : null}
                        {form.errors.start_time ? (
                            <p className="text-xs text-destructive">
                                {form.errors.start_time}
                            </p>
                        ) : null}
                        {form.errors.end_time ? (
                            <p className="text-xs text-destructive">
                                {form.errors.end_time}
                            </p>
                        ) : null}

                        <DialogFooter className="gap-2 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeBookingDialog}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing
                                    ? t('rooms.submitting')
                                    : t('rooms.submit_request')}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </RoomAvailabilityShell>
    );
}
