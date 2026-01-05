import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

const schema = yup.object({
  email: yup.string().email('Invalid email address').required('Email is required'),
}).required();

export default function ForgotPassword() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema)
  });
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (data) => {
    // const res = await api.post('/auth/forgot-password', { email: data.email });
    // Demo simulation
    await new Promise(r => setTimeout(r, 1500));
    console.log('Reset request for:', data.email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="card w-full max-w-md text-center py-12 animate-in zoom-in duration-300">
          <div className="inline-flex p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Check your mail</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            We've sent a password reset link to your email address.
          </p>
          <Link to="/login" className="btn w-full justify-center">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-center gradient-text">Forgot Password?</h2>
          <p className="text-slate-500 text-xs dark:text-slate-400 mt-2">No worries, it happens. Enter your email and we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                className={`form-input pl-10 h-11 ${errors.email ? 'border-red-500 focus:border-red-500' : ''
                  }`}
                placeholder="name@example.com"
                {...register('email')}
              />
            </div>

            {errors.email && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{errors.email.message}</p>}
          </div>

          <button
            className="btn w-full h-11 justify-center shadow-lg shadow-indigo-500/20"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
          </button>

          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
}
