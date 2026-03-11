<?php

namespace App\Http\Requests;

use App\Models\RoomRequest;
use Illuminate\Foundation\Http\FormRequest;

class CancelRoomRequestRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $roomRequest = $this->route('roomRequest');

        return $roomRequest instanceof RoomRequest
            && $this->user()->can('cancel', $roomRequest);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [];
    }
}
