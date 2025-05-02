import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  stripePriceId: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 10,
    interval: 'month',
    stripePriceId: 'price_monthly',
    features: [
      'Unlimited AI chat',
      'Voice interactions',
      'Priority support',
    ],
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 100,
    interval: 'year',
    stripePriceId: 'price_annual',
    features: [
      'All Monthly features',
      'Save 17%',
      'Early access to new features',
    ],
  },
];

const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSubscribe = async (plan: Plan): Promise<void> => {
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      setLoading(true);
      // Stripe integration is temporarily disabled
      window.alert('Subscription functionality is temporarily disabled');
    } catch (error) {
      console.error('Error:', error);
      window.alert('Failed to process subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-400 hover:text-white"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back
        </button>

        <h1 className="mb-8 text-center text-4xl font-bold">Choose Your Plan</h1>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className="rounded-lg border border-gray-700 bg-gray-800 p-6"
            >
              <h2 className="mb-4 text-2xl font-semibold">{plan.name}</h2>
              <p className="mb-6 text-3xl font-bold">
                ${plan.price}
                <span className="text-base font-normal text-gray-400">
                  /{plan.interval}
                </span>
              </p>

              <ul className="mb-6 space-y-4">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <svg
                      className="mr-3 h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Subscribe ${plan.interval}ly`}
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center">
          <Shield className="h-4 w-4 mr-2" />
          Secure, encrypted payment processing
        </div>
      </div>
    </div>
  );
};

export default Subscription;