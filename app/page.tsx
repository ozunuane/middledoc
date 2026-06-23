import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Accountant Hub</h1>
          <p className="text-gray-600">Manage client documents effortlessly</p>
        </div>

        <div className="space-y-4">
          <Link
            href="/auth/login"
            className="w-full block text-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="w-full block text-center bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>For clients uploading documents:</p>
          <p className="mt-2">Use the secure link provided by your accountant</p>
        </div>
      </main>
    </div>
  )
}
