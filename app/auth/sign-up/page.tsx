export default function SignUpPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-input bg-background px-3 py-2 rounded-md focus:ring-2 focus:ring-ring outline-none"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border border-input bg-background px-3 py-2 rounded-md focus:ring-2 focus:ring-ring outline-none"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            className="w-full border border-input bg-background px-3 py-2 rounded-md focus:ring-2 focus:ring-ring outline-none"
            placeholder="John Doe"
          />
        </div>
        <button type="submit" className="w-full btn-primary">
          Create Account
        </button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{" "}
        <a href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </a>
      </p>
    </div>
  );
}