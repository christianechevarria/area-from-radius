import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';

const schema = z.object({
    radius: z
      .string()
      .trim()
      .min(1, { message: 'Radius must be provided' })
      .refine(val => /^\d*\.?\d+$/.test(val), {
        message: 'Radius must be numeric',
      })
      .refine(
        val => {
          const num = Number(val);
          return num >= 1 && num <= 100;
        },
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

  const {
    register,
    formState: { errors },
    getValues,
    trigger,
    clearErrors,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const clearMessages = () => {
    // Clear API and result messages
    setApiError('');
    setResultMessage('');
    setSuccess(null);

    // Clear frontend form errors
    clearErrors('radius');
  };

  const submitToApi = async (radiusNum: string | number) => {
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

  const handleCustomSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearMessages();

    // Manually trigger form validation
    await trigger();
    
    // Submit to API even with client-side errors
    submitToApi(getValues('radius'));
  };

  return (
    <form onSubmit={handleCustomSubmit} className="max-w-md mx-auto p-4 bg-white">
        <label htmlFor="radius" className="block text-gray-700">Radius:</label>
        <input
            id="radius"
            type="text"
            {...register('radius', {
            onChange: () => clearMessages(), // Clear all messages on change
            })}
            className="mt-1 p-2 block w-full text-black border-2 border-gray-400 focus:border-blue-500 rounded-md shadow-sm"
        />
        {errors.radius && <p className="h-6 mt-2 text-red-500">{`Form Error: ${errors.radius.message}`}</p>}
        <button type="submit" className="bg-blue-500 text-white py-2 mt-2 w-full px-4 rounded-md">Calculate</button>
        {resultMessage && (
        <p className={`h-6 m-2 ${success ? 'text-green-500' : 'text-red-500'}`}>{resultMessage}</p>
        )}
        {apiError && <p className="h-6 m-2 text-red-500">{apiError}</p>}
    </form>
  );
}
