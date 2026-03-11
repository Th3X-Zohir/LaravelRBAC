<?php

namespace App\Http\Requests;

use App\Models\Room;
use App\Models\RoomRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreRoomRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('request room') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'room_id' => ['required', 'exists:rooms,id'],
            'date' => ['required', Rule::date()->todayOrAfter()],
            'start_time' => [
                'required',
                'date_format:H:i',
                Rule::in(array_column(RoomRequest::availableSlots(), 'start_time')),
            ],
            'end_time' => ['required', 'date_format:H:i'],
            'purpose' => ['required', 'string', 'max:500'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $room = Room::query()->find($this->integer('room_id'));

                if (! $room instanceof Room) {
                    return;
                }

                if ($room->status !== 'available') {
                    $validator->errors()->add('room_id', 'This room is not available for booking.');

                    return;
                }

                $slot = RoomRequest::slotForStartTime($this->string('start_time')->toString());

                if ($slot === null || $slot['end_time'] !== $this->string('end_time')->toString()) {
                    $validator->errors()->add('end_time', 'Select one of the available 90-minute time slots.');

                    return;
                }

                $hasConflict = RoomRequest::query()
                    ->where('room_id', $room->id)
                    ->whereDate('date', $this->string('date')->toString())
                    ->where('status', 'approved')
                    ->overlapping($slot['start_time'], $slot['end_time'])
                    ->exists();

                if ($hasConflict) {
                    $validator->errors()->add('start_time', 'This time slot is already booked for the selected date.');
                }
            },
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date.after_or_equal' => 'The booking date must be today or a future date.',
            'start_time.in' => 'Select one of the available 90-minute time slots.',
        ];
    }
}
