import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    // @ts-expect-error - zodResolver type mismatch with zod v3
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsSubmitting(true);
      setError('');
      await signup(data.email, data.password, data.name);
      navigate('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        const errorMessage = err.response.data?.error?.message || 'Signup failed';
        if (err.response.status === 409) {
          setError('This email is already registered. Try logging in instead.');
        } else {
          setError(errorMessage);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {error && (
          <div style={{ padding: '10px', backgroundColor: '#fee', color: '#c00', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            {...register('name')}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.name && <span style={{ color: 'red', fontSize: '14px' }}>{errors.name.message}</span>}
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.email && <span style={{ color: 'red', fontSize: '14px' }}>{errors.email.message}</span>}
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px', marginTop: '4px' }}
          />
          {errors.password && <span style={{ color: 'red', fontSize: '14px' }}>{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Signing up...' : 'Sign Up'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
