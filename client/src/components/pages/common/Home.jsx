import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-50">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled ? "bg-white shadow-md py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                CivicPulse
              </span>
            </div>

            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-8">
                <a
                  href="#features"
                  className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  How it works
                </a>
                <a
                  href="#testimonials"
                  className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  Testimonials
                </a>
                <a
                  href="#faq"
                  className="text-gray-700 hover:text-teal-600 transition-colors font-medium"
                >
                  FAQ
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-teal-600 hover:text-teal-800 font-medium transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-4 py-2 rounded-lg shadow-md font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-40 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M0 40L40 0M20 40L40 20M0 20L20 0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect
                width="100%"
                height="100%"
                fill="url(#grid)"
                className="text-teal-700"
              />
            </svg>
          </div>
        </div>

        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-amber-300 mix-blend-multiply opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-teal-300 mix-blend-multiply opacity-20 blur-3xl"></div>
        <div className="absolute top-1/3 left-2/3 w-60 h-60 rounded-full bg-cyan-300 mix-blend-multiply opacity-20 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Report civic issues{" "}
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  with ease
                </span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8">
                Empower your community with a simple way to report and track
                local infrastructure problems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-6 py-3 rounded-lg shadow-md font-medium text-lg transition-colors"
                >
                  Get Started
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center border border-teal-500 text-teal-600 hover:bg-teal-50 px-6 py-3 rounded-lg font-medium text-lg transition-colors"
                >
                  How It Works
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>

              <div className="mt-8 flex flex-wrap justify-center lg:justify-start gap-8">
                <div className="flex items-center">
                  <div className="flex -space-x-2 mr-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-teal-600"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-600">Used by 10K+ citizens</span>
                </div>
                <div className="flex items-center">
                  <div className="flex items-center text-amber-500 mr-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-gray-600">4.9 satisfaction</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:block mt-12 lg:mt-0 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-72 w-72 rounded-full bg-gradient-to-r from-teal-400 to-cyan-300 opacity-20 blur-3xl"></div>
              </div>
              <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-16 flex items-center px-6">
                  <div className="flex space-x-2 absolute">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-white font-medium w-full text-center">
                    Report Civic Issue
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Issue Type
                    </label>
                    <div className="border border-gray-300 rounded-lg h-10 bg-gray-50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <div className="border border-gray-300 rounded-lg h-10 bg-gray-50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <div className="border border-gray-300 rounded-lg h-20 bg-gray-50"></div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Upload Photo
                    </label>
                    <div className="border border-dashed border-gray-300 rounded-lg h-16 bg-gray-50 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  </div>
                  <button className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-2 rounded-lg font-medium">
                    Submit Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              All the tools you need to improve your community
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              CivicPulse provides a comprehensive platform for citizens and
              local governments to collaborate on city improvements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                ),
                title: "Map-Based Reporting",
                description:
                  "Pinpoint exact locations on an interactive map to ensure accurate issue reporting and tracking.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                ),
                title: "Photo Evidence",
                description:
                  "Upload photos directly from your device to provide visual context for reported issues.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                ),
                title: "Status Tracking",
                description:
                  "Follow the progress of reported issues from submission to resolution with real-time updates.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                    />
                  </svg>
                ),
                title: "Community Discussion",
                description:
                  "Engage with other citizens and government officials to discuss reported issues and solutions.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                ),
                title: "Analytics Dashboard",
                description:
                  "View comprehensive analytics on reported issues, response times, and resolution rates.",
              },
              {
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                ),
                title: "Notifications",
                description:
                  "Receive timely updates about your reported issues and nearby community problems.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50/80 rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works section */}

      <section
        id="how-it-works"
        className="py-20 bg-gradient-to-br from-teal-50 via-sky-50 to-indigo-50 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern
                id="grid2"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 40L40 0M20 40L40 20M0 20L20 0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#grid2)"
              className="text-teal-700"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              How CivicPulse works
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Our streamlined process makes it easy to report issues and get
              them resolved
            </p>
          </div>

          <div className="relative">
            {/* Fixed Timeline connector - adjusted positioning and z-index */}
            <div
              className="hidden md:block absolute h-1 bg-gradient-to-r from-teal-500 to-cyan-500 top-12 z-0"
              style={{
                left: "12.5%",
                right: "12.5%",
                width: "75%",
              }}
            ></div>
            <div className="grid md:grid-cols-4 gap-8 relative">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Report an Issue",
                  description:
                    "Identify a civic problem and submit it through our app with photos and location.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ),
                  title: "Verification",
                  description:
                    "Our system assigns the case to the appropriate government department.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                  ),
                  title: "Track Progress",
                  description:
                    "Follow real-time updates as your issue moves through the resolution process.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ),
                  title: "Resolution",
                  description:
                    "Receive confirmation when your reported issue has been successfully resolved.",
                },
              ].map((step, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
                  {/* Added z-10 to make circles appear above the line */}
                  <div className="bg-white rounded-full h-24 w-24 flex items-center justify-center shadow-lg border-4 border-white z-10 relative mb-6">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-500 h-16 w-16 rounded-full flex items-center justify-center text-white">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>

            {/* Added call to action button */}
            <div className="mt-12 text-center">
              <Link
                to="/register"
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white px-8 py-3 rounded-lg shadow-md font-medium text-lg transition-all transform hover:-translate-y-1 hover:shadow-lg inline-flex items-center"
              >
                Get Started
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              What our community is saying
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Join thousands of citizens who are making a difference in their
              communities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Resident, Downtown",
                image: "https://randomuser.me/api/portraits/women/32.jpg",
                quote:
                  "CivicPulse made it so easy to report the pothole on my street. Within a week, it was fixed! I'm impressed by how responsive our local government became once they started using this platform.",
              },
              {
                name: "Michael Chang",
                role: "Community Organizer",
                image: "https://randomuser.me/api/portraits/men/46.jpg",
                quote:
                  "As someone who coordinates neighborhood cleanups, this app has been a game-changer. We can efficiently report multiple issues and track their resolution. It's strengthened our partnership with city officials.",
              },
              {
                name: "Lisa Rodríguez",
                role: "City Works Department",
                image: "https://randomuser.me/api/portraits/women/65.jpg",
                quote:
                  "From the government side, CivicPulse has transformed how we handle citizen reports. The categorization and location data helps us dispatch the right teams quickly and provide better service to our community.",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-gray-50/80 rounded-2xl p-8 border border-gray-100 shadow-sm"
              >
                <div className="text-amber-500 flex mb-6">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-gray-600 mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover mr-4 border-2 border-teal-200"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to know about CivicPulse
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is CivicPulse free to use?",
                answer:
                  "Yes! CivicPulse is completely free for citizens to report and track civic issues. We partner with local governments who subscribe to our service to ensure timely responses to community concerns.",
              },
              {
                question: "How quickly will my reported issue be addressed?",
                answer:
                  "Response times vary depending on the type of issue and the current workload of government departments. However, our system ensures that all issues are categorized by urgency, and you can track the status of your report in real-time.",
              },
              {
                question: "Can I report issues anonymously?",
                answer:
                  "While you need an account to submit reports, you can choose to keep your identity private from public view. Government officials may still see your information to follow up if needed.",
              },
              {
                question: "What kinds of issues can I report?",
                answer:
                  "You can report a wide range of civic issues including but not limited to: potholes, broken streetlights, water leaks, graffiti, illegal dumping, fallen trees, malfunctioning traffic signals, and more.",
              },
              {
                question: "Is CivicPulse available in my city?",
                answer:
                  "We're rapidly expanding to cities across the country. Create an account to check if your city is currently supported. If not, we encourage you to recommend CivicPulse to your local government officials.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl mb-4">
            Ready to improve your community?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Join thousands of active citizens who are making their neighborhoods
            better, one report at a time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-teal-600 hover:bg-gray-100 px-8 py-3 rounded-lg shadow-md font-medium text-lg transition-colors"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-medium text-lg transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold text-lg mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Community
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Partners
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Developers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Data Processing
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </div>
              <span className="ml-3 text-xl font-bold">CivicPulse</span>
            </div>

            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} CivicPulse. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
