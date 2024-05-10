'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const schema = z.object({
  radius: z
    .string()
    .refine((val) => !isNaN(Number(val)), { message: 'Radius must be numeric' })
    .refine(
      (val) => Number(val) >= 1 && Number(val) <= 100,
      { message: 'Radius must be between 1 and 100' }
    ),
});

interface FormValues {
  radius: string;
}

export default function Form() {
  const [apiError, setApiError] = useState<string>('');
  const [resultMessage, setResultMessage] = useState<string>('');
  const [success, setSuccess] = useState<boolean | null>(null);

  const { register, handleSubmit, setError, clearErrors, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const clearMessages = () => {
    setApiError('');
    setResultMessage('');
    setSuccess(null);
  };

  const onSubmit = async (data: FormValues) => {
    clearErrors('radius');
    setApiError('');

    // Convert radius to a number before submitting to the backend
    const radiusNum = parseFloat(data.radius);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ radius: radiusNum }),
      });

      const result = await response.json();

      if (result.error) {
        console.error('API Error:', result.error);
        setApiError(`API Error: ${result.error}`);
        setResultMessage('');
        setSuccess(false);
      } else {
        setResultMessage(`The area is: ${result.area}`);
        setApiError('');
        setSuccess(true);
      }
    } catch (err) {
      console.error('API Error:', err);
      setApiError('API Error: An unexpected error occurred during validation.');
      setSuccess(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-4">
      <div className="mb-4">
        <label htmlFor="radius" className="block text-gray-700">Radius:</label>
        <input
          id="radius"
          type="text"
          {...register('radius', {
            onChange: () => clearMessages(),
          })}
          className="mt-1 block w-full text-black border-gray-300 rounded-md shadow-sm"
        />
        {errors.radius && <p className="text-red-500">{`Form Error: ${errors.radius.message}`}</p>}
      </div>
      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-md">Calculate</button>
      {resultMessage && (
        <p className={success ? 'text-green-500' : 'text-red-500'}>{resultMessage}</p>
      )}
      {apiError && <p className="text-red-500">{apiError}</p>}
    </form>
  );
}
