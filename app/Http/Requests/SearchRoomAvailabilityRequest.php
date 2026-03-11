<?php

namespace App\Http\Requests;

use App\Models\RoomRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchRoomAvailabilityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'date' => ['required', Rule::date()->todayOrAfter()],
            'start_time' => [
                'required',
                'date_format:H:i',
                Rule::in(array_column(RoomRequest::availableSlots(), 'start_time')),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'date.required' => 'Choose a date first.',
            'start_time.required' => 'Choose a time slot.',
            'start_time.in' => 'Choose one of the fixed 90-minute slots.',
        ];
    }
}
