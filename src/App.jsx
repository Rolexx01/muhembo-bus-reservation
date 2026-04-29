import React, { useMemo, useState } from "react";

const initialRoutes = [
  { id: 1, from: "Nairobi", to: "Kisumu", price: 1500, time: "08:00 AM", bus: "Muhembo Express 01", seats: 40 },
  { id: 2, from: "Nairobi", to: "Mombasa", price: 2200, time: "09:30 AM", bus: "Muhembo Coast 02", seats: 40 },
  { id: 3, from: "Kisumu", to: "Nairobi", price: 1500, time: "07:00 AM", bus: "Muhembo Express 03", seats: 40 },
  { id: 4, from: "Nakuru", to: "Eldoret", price: 1200, time: "02:00 PM", bus: "Muhembo Rift 04", seats: 40 },
  { id: 5, from: "Nairobi", to: "Malindi", price: 2500, time: "10:00 PM", bus: "Muhembo Coast 05", seats: 40 },
  { id: 6, from: "Nairobi", to: "Kitale", price: 1800, time: "06:30 AM", bus: "Muhembo Valley 06", seats: 40 },
  { id: 7, from: "Mombasa", to: "Nairobi", price: 2200, time: "08:30 PM", bus: "Muhembo Coast 07", seats: 40 },
  { id: 8, from: "Nairobi", to: "Busia", price: 2000, time: "07:30 PM", bus: "Muhembo Western 08", seats: 40 },
  { id: 9, from: "Nairobi", to: "Kakamega", price: 1800, time: "09:00 PM", bus: "Muhembo Western 09", seats: 40 },
  { id: 10, from: "Eldoret", to: "Nairobi", price: 1600, time: "06:00 AM", bus: "Muhembo Rift 10", seats: 40 },
];

export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({ name: "", contact: "", message: "" });

  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("muhemboUsers")) || [];
    } catch {
      return [];
    }
  });

  const [routes, setRoutes] = useState(initialRoutes);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [newRoute, setNewRoute] = useState({ from: "", to: "", price: "", time: "", bus: "", seats: "40" });

  const [bookingForm, setBookingForm] = useState({
    from: "",
    to: "",
    routeId: "",
    travelDate: "",
    passengerName: "",
    phone: "",
    seatNo: "",
    paymentMethod: "MPESA",
    paymentPhone: "",
    cardNumber: "",
  });

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) =>
      `${route.from} ${route.to} ${route.bus}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [routes, search]);

  const towns = [...new Set(routes.flatMap((route) => [route.from, route.to]))].sort();

  const destinationTowns = bookingForm.from
    ? [...new Set(routes.filter((route) => route.from === bookingForm.from).map((route) => route.to))].sort()
    : towns;

  const matchingRoutes = routes.filter(
    (route) =>
      (!bookingForm.from || route.from === bookingForm.from) &&
      (!bookingForm.to || route.to === bookingForm.to)
  );

  const selectedRoute = routes.find((route) => String(route.id) === String(bookingForm.routeId));

  const bookedSeats = bookings
    .filter((booking) => String(booking.routeId) === String(bookingForm.routeId) && booking.travelDate === bookingForm.travelDate)
    .map((booking) => Number(booking.seatNo));

  const availableSeats = selectedRoute
    ? Array.from({ length: Number(selectedRoute.seats) }, (_, i) => i + 1).filter((seat) => !bookedSeats.includes(seat))
    : [];

  function saveUsers(users) {
    setRegisteredUsers(users);
    localStorage.setItem("muhemboUsers", JSON.stringify(users));
  }

  function showSuccess(message) {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  }

  function submitInquiry(e) {
    e.preventDefault();

    if (!inquiryForm.name || !inquiryForm.contact || !inquiryForm.message) {
      alert("Please fill in your name, contact, and message.");
      return;
    }

    const savedInquiries = JSON.parse(localStorage.getItem("muhemboInquiries") || "[]");

    localStorage.setItem(
      "muhemboInquiries",
      JSON.stringify([{ id: Date.now(), ...inquiryForm }, ...savedInquiries])
    );

    setInquiryForm({ name: "", contact: "", message: "" });
    setShowInquiryForm(false);
    showSuccess("Inquiry sent successfully. We will get back to you soon.");
  }

  function signup() {
    if (!authForm.name || !authForm.email || !authForm.password) {
      alert("Please enter your full name, email, and password.");
      return;
    }

    const emailExists = registeredUsers.some(
      (account) => account.email.toLowerCase() === authForm.email.toLowerCase()
    );

    if (emailExists) {
      alert("An account with this email already exists. Please login instead.");
      setAuthMode("login");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
      role: "user",
    };

    saveUsers([...registeredUsers, newUser]);
    showSuccess("Account created successfully. You can now login.");
    setAuthMode("login");
  }

  function resetPassword() {
    if (!authForm.email || !authForm.password) {
      alert("Please enter your registered email and new password.");
      return;
    }

    const existingUser = registeredUsers.find(
      (account) => account.email.toLowerCase() === authForm.email.toLowerCase()
    );

    if (!existingUser) {
      alert("No account found with this email. Please create an account first.");
      setAuthMode("signup");
      return;
    }

    const updatedUsers = registeredUsers.map((account) =>
      account.email.toLowerCase() === authForm.email.toLowerCase()
        ? { ...account, password: authForm.password }
        : account
    );

    saveUsers(updatedUsers);
    showSuccess("Password reset successfully. You can now login.");
    setAuthMode("login");
  }

  function login(role) {
    if (!authForm.email || !authForm.password) {
      alert("Please enter email and password.");
      return;
    }

    if (role === "admin") {
      if (authForm.email === "admin@muhembo.com" && authForm.password === "12345") {
        setUser({ name: "Admin", email: authForm.email, role: "admin" });
        setPage("admin");
        return;
      }

      alert("Invalid admin login. Use admin@muhembo.com and password 12345.");
      return;
    }

    const existingUser = registeredUsers.find(
      (account) => account.email.toLowerCase() === authForm.email.toLowerCase()
    );

    if (!existingUser) {
      alert("Account not found. Please create an account first.");
      setAuthMode("signup");
      return;
    }

    if (existingUser.password !== authForm.password) {
      alert("Wrong password. Please try again.");
      return;
    }

    setUser({ name: existingUser.name, email: existingUser.email, role: "user" });
    setPage("dashboard");
  }

  function logout() {
    setUser(null);
    setPage("home");
  }

  function makeBooking(e) {
    e.preventDefault();

    if (!user) {
      alert("Please login first.");
      setPage("login");
      return;
    }

    if (!selectedRoute || !bookingForm.travelDate || !bookingForm.passengerName || !bookingForm.phone || !bookingForm.seatNo || !bookingForm.paymentMethod) {
      alert("Please complete all booking fields.");
      return;
    }

    if (bookingForm.paymentMethod === "MPESA" && !bookingForm.paymentPhone) {
      alert("Please enter the M-Pesa phone number.");
      return;
    }

    if (bookingForm.paymentMethod === "CARD" && !bookingForm.cardNumber) {
      alert("Please enter the card number.");
      return;
    }

    if (bookedSeats.includes(Number(bookingForm.seatNo))) {
      alert("This seat is already booked. Please choose another seat.");
      return;
    }

    const booking = {
      id: Date.now(),
      userEmail: user.email,
      routeId: selectedRoute.id,
      route: `${selectedRoute.from} to ${selectedRoute.to}`,
      bus: selectedRoute.bus,
      travelDate: bookingForm.travelDate,
      time: selectedRoute.time,
      passengerName: bookingForm.passengerName,
      phone: bookingForm.phone,
      seatNo: bookingForm.seatNo,
      amount: selectedRoute.price,
      status: "Confirmed",
      paymentMethod: bookingForm.paymentMethod,
      paymentStatus: bookingForm.paymentMethod === "CASH" ? "Pay at Office" : "Paid",
    };

    setBookings([booking, ...bookings]);

    setBookingForm({
      from: "",
      to: "",
      routeId: "",
      travelDate: "",
      passengerName: "",
      phone: "",
      seatNo: "",
      paymentMethod: "MPESA",
      paymentPhone: "",
      cardNumber: "",
    });

    setPage("my-bookings");
  }

  function addRoute(e) {
    e.preventDefault();

    if (!newRoute.from || !newRoute.to || !newRoute.price || !newRoute.time || !newRoute.bus) {
      alert("Please fill all route fields.");
      return;
    }

    setRoutes([
      ...routes,
      {
        id: Date.now(),
        from: newRoute.from,
        to: newRoute.to,
        price: Number(newRoute.price),
        time: newRoute.time,
        bus: newRoute.bus,
        seats: Number(newRoute.seats || 40),
      },
    ]);

    setNewRoute({ from: "", to: "", price: "", time: "", bus: "", seats: "40" });
  }

  function deleteBooking(id) {
    setBookings(bookings.filter((booking) => booking.id !== id));
  }

  const myBookings =
    user?.role === "admin" ? bookings : bookings.filter((booking) => booking.userEmail === user?.email);

  return (
    <div className="min-h-screen text-slate-900 app-bg">
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => setPage("home")} className="flex items-center gap-3 font-bold text-xl logo-text">
            <span className="logo-icon">🚌</span>
            <span className="logo-buu">Muhembo</span>
            <span className="logo-pass">Bus</span>
            <span className="nav-slogan">Travel Smart, Travel Muhembo</span>
          </button>

          <div className="hidden md:flex items-center gap-4 text-sm font-medium">
            <button onClick={() => setPage("home")} className="hover:text-blue-700">Home</button>
            <button onClick={() => setPage("routes")} className="hover:text-blue-700">Routes</button>
            <button onClick={() => setPage("book")} className="hover:text-blue-700">Book Ticket</button>
            {user && <button onClick={() => setPage("my-bookings")} className="hover:text-blue-700">My Bookings</button>}
            {user?.role === "admin" && <button onClick={() => setPage("admin")} className="hover:text-blue-700">Admin</button>}
          </div>

          <div>
            {user ? (
              <button onClick={logout} className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm">
                🚪 Logout
              </button>
            ) : (
              <button onClick={() => setPage("login")} className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm">
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {successMessage && (
        <div className="success-popup">
          <span>✅</span>
          <strong>{successMessage}</strong>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-8">
        {page === "home" && (
          <section className="grid md:grid-cols-2 gap-8 items-center py-10">
            <div>
              <p className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
                🎫 Simple Online Ticket Booking
              </p>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-5">
                Book your Muhembo bus seat online.
              </h1>

              <p className="text-slate-600 text-lg mb-6">
                A simple bus reservation system for route viewing, seat booking, ticket confirmation, and admin management.
              </p>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setPage("book")} className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-semibold">
                  Book Now
                </button>

                <button onClick={() => setPage("routes")} className="bg-white border border-slate-300 px-6 py-3 rounded-2xl font-semibold">
                  View Routes
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg p-6 border border-slate-200">
              <div className="bg-gradient-to-br from-blue-700 to-slate-900 rounded-3xl p-8 text-white">
                <div className="text-6xl mb-8">🚌</div>
                <h2 className="text-3xl font-bold mb-3">Muhembo Express</h2>
                <p className="text-amber-200 font-semibold mb-2">Travel Smart, Travel Muhembo</p>
                <p className="text-blue-100 mb-8">Nairobi • Kisumu • Mombasa • Nakuru • Eldoret</p>

                <div className="grid grid-cols-3 gap-3">
                  <InfoCard label="Routes" value={routes.length} />
                  <InfoCard label="Bookings" value={bookings.length} />
                  <InfoCard label="Seats" value="40+" />
                </div>
              </div>
            </div>
          </section>
        )}

        {page === "login" && (
          <section className="max-w-md mx-auto bg-white rounded-3xl shadow p-6 border border-slate-200">
            <h2 className="text-3xl font-bold mb-2">
              {authMode === "login" ? "Login" : authMode === "signup" ? "Create Account" : "Reset Password"}
            </h2>

            <p className="text-slate-600 mb-6">
              {authMode === "login"
                ? "Login with your passenger account, or use the admin login details."
                : authMode === "signup"
                ? "Create a passenger account to book and manage your tickets."
                : "Enter your registered email and choose a new password."}
            </p>

            <div className="auth-tabs three-tabs">
              <button type="button" onClick={() => setAuthMode("login")} className={authMode === "login" ? "active-auth-tab" : ""}>Login</button>
              <button type="button" onClick={() => setAuthMode("signup")} className={authMode === "signup" ? "active-auth-tab" : ""}>Sign Up</button>
              <button type="button" onClick={() => setAuthMode("forgot")} className={authMode === "forgot" ? "active-auth-tab" : ""}>Forgot</button>
            </div>

            <div className="space-y-4">
              {authMode === "signup" && (
                <input className="input" placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
              )}

              <input className="input" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />

              <div className="password-field">
                <input
                  className="input password-input"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                />

                <button type="button" className="eye-button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {authMode === "signup" ? (
                <button onClick={signup} className="w-full bg-green-600 text-white py-3 rounded-2xl font-semibold">
                  ✅ Create Passenger Account
                </button>
              ) : authMode === "forgot" ? (
                <>
                  <button onClick={resetPassword} className="w-full bg-amber-500 text-white py-3 rounded-2xl font-semibold">
                    🔐 Reset Password
                  </button>
                  <button type="button" onClick={() => setAuthMode("login")} className="w-full bg-slate-100 text-slate-700 py-3 rounded-2xl font-semibold">
                    Back to Login
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => login("user")} className="w-full bg-blue-700 text-white py-3 rounded-2xl font-semibold">
                    👤 Login as Passenger
                  </button>

                  <button onClick={() => login("admin")} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-semibold">
                    🛡️ Login as Admin
                  </button>

                  <button type="button" onClick={() => setAuthMode("forgot")} className="forgot-link">
                    Forgot password?
                  </button>

                  <div className="admin-hint">Admin: admin@muhembo.com / 12345</div>
                </>
              )}
            </div>
          </section>
        )}

        {page === "dashboard" && user && (
          <section>
            <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}</h2>
            <p className="text-slate-600 mb-6">Choose an action below.</p>

            <div className="grid md:grid-cols-3 gap-5">
              <ActionCard icon="🚌" title="View Routes" text="Check available Muhembo bus routes." onClick={() => setPage("routes")} />
              <ActionCard icon="🎫" title="Book Ticket" text="Reserve a seat for your journey." onClick={() => setPage("book")} />
              <ActionCard icon="📅" title="My Bookings" text="View your confirmed tickets." onClick={() => setPage("my-bookings")} />
            </div>
          </section>
        )}

        {page === "routes" && (
          <section>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-3xl font-bold">Available Routes</h2>
                <p className="text-slate-600">Search and choose your preferred journey.</p>
              </div>

              <div className="relative max-w-sm w-full">
                <span className="absolute left-3 top-3 text-slate-400">🔍</span>
                <input className="input pl-10" placeholder="Search route or bus" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {filteredRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onBook={() => {
                    setBookingForm({ ...bookingForm, from: route.from, to: route.to, routeId: route.id });
                    setPage("book");
                  }}
                />
              ))}
            </div>
          </section>
        )}

        {page === "book" && (
          <section className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={makeBooking} className="lg:col-span-2 bg-white rounded-3xl shadow p-6 border border-slate-200">
              <h2 className="text-3xl font-bold mb-2">Book Ticket</h2>
              <p className="text-slate-600 mb-6">Fill in the booking details and select an available seat.</p>

              <div className="grid md:grid-cols-2 gap-4">
                <select className="input" value={bookingForm.from} onChange={(e) => setBookingForm({ ...bookingForm, from: e.target.value, to: "", routeId: "", seatNo: "" })}>
                  <option value="">From town</option>
                  {towns.map((town) => <option key={town} value={town}>{town}</option>)}
                </select>

                <select className="input" value={bookingForm.to} onChange={(e) => setBookingForm({ ...bookingForm, to: e.target.value, routeId: "", seatNo: "" })}>
                  <option value="">To town</option>
                  {destinationTowns.map((town) => <option key={town} value={town}>{town}</option>)}
                </select>

                <select className="input md:col-span-2" value={bookingForm.routeId} onChange={(e) => setBookingForm({ ...bookingForm, routeId: e.target.value, seatNo: "" })} disabled={!bookingForm.from || !bookingForm.to}>
                  <option value="">Select available bus</option>
                  {matchingRoutes.map((route) => (
                    <option key={route.id} value={route.id}>
                      {route.bus} - {route.time} - KES {route.price}
                    </option>
                  ))}
                </select>

                <input className="input" type="date" value={bookingForm.travelDate} onChange={(e) => setBookingForm({ ...bookingForm, travelDate: e.target.value, seatNo: "" })} />
                <input className="input" placeholder="Passenger name" value={bookingForm.passengerName} onChange={(e) => setBookingForm({ ...bookingForm, passengerName: e.target.value })} />
                <input className="input" placeholder="Phone number" value={bookingForm.phone} onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })} />

                <div className="md:col-span-2 border border-slate-200 rounded-3xl p-5 bg-slate-50">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                    <div>
                      <h3 className="text-xl font-bold">Select Seat</h3>
                      <p className="text-slate-600 text-sm">Tap an available seat button to reserve it.</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="px-3 py-1 rounded-full bg-white border border-slate-300">Available</span>
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-900">Selected</span>
                      <span className="px-3 py-1 rounded-full bg-red-600 text-white">Booked</span>
                    </div>
                  </div>

                  {!selectedRoute || !bookingForm.travelDate ? (
                    <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-500">
                      Select route, bus, and travel date to view seats.
                    </div>
                  ) : (
                    <div className="max-w-sm mx-auto">
                      <div className="flex justify-end mb-3">
                        <div className="w-16 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold">
                          Dr.
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {Array.from({ length: Number(selectedRoute.seats) }, (_, i) => i + 1).map((seat) => {
                          const isBooked = bookedSeats.includes(seat);
                          const isSelected = Number(bookingForm.seatNo) === seat;

                          return (
                            <button
                              type="button"
                              key={seat}
                              disabled={isBooked}
                              onClick={() => setBookingForm({ ...bookingForm, seatNo: String(seat) })}
                              className={`h-12 rounded-xl border font-semibold transition ${
                                isBooked
                                  ? "bg-red-600 text-white border-red-600 cursor-not-allowed"
                                  : isSelected
                                  ? "bg-amber-400 text-slate-900 border-amber-400"
                                  : "bg-white border-slate-400 hover:bg-blue-50 hover:border-blue-600"
                              }`}
                            >
                              {seat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 border border-slate-200 rounded-3xl p-5 bg-white">
                <h3 className="text-xl font-bold mb-2">Payment Details</h3>
                <p className="text-slate-600 text-sm mb-4">Choose how the passenger will pay for the ticket.</p>

                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <button type="button" onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "MPESA" })} className={`p-4 rounded-2xl border text-left ${bookingForm.paymentMethod === "MPESA" ? "border-green-600 bg-green-50" : "border-slate-300 bg-white"}`}>
                    <p className="font-bold">📱 M-Pesa</p>
                    <p className="text-xs text-slate-500">STK push demo</p>
                  </button>

                  <button type="button" onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "CARD" })} className={`p-4 rounded-2xl border text-left ${bookingForm.paymentMethod === "CARD" ? "border-blue-600 bg-blue-50" : "border-slate-300 bg-white"}`}>
                    <p className="font-bold">💳 Card</p>
                    <p className="text-xs text-slate-500">Visa / Mastercard</p>
                  </button>

                  <button type="button" onClick={() => setBookingForm({ ...bookingForm, paymentMethod: "CASH" })} className={`p-4 rounded-2xl border text-left ${bookingForm.paymentMethod === "CASH" ? "border-amber-500 bg-amber-50" : "border-slate-300 bg-white"}`}>
                    <p className="font-bold">💵 Cash</p>
                    <p className="text-xs text-slate-500">Pay at office</p>
                  </button>
                </div>

                {bookingForm.paymentMethod === "MPESA" && (
                  <input className="input" placeholder="M-Pesa phone number e.g. 07XXXXXXXX" value={bookingForm.paymentPhone} onChange={(e) => setBookingForm({ ...bookingForm, paymentPhone: e.target.value })} />
                )}

                {bookingForm.paymentMethod === "CARD" && (
                  <input className="input" placeholder="Card number e.g. 4242 4242 4242 4242" value={bookingForm.cardNumber} onChange={(e) => setBookingForm({ ...bookingForm, cardNumber: e.target.value })} />
                )}

                {bookingForm.paymentMethod === "CASH" && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                    Passenger will pay at the booking office before boarding.
                  </div>
                )}
              </div>

              <button className="mt-6 bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-2xl font-semibold">
                Confirm Booking & Pay
              </button>
            </form>

            <div className="bg-white rounded-3xl shadow p-6 border border-slate-200 h-fit">
              <h3 className="text-xl font-bold mb-4">Booking Summary</h3>

              {selectedRoute ? (
                <div className="space-y-3 text-sm">
                  <p><strong>Route:</strong> {selectedRoute.from} to {selectedRoute.to}</p>
                  <p><strong>Bus:</strong> {selectedRoute.bus}</p>
                  <p><strong>Time:</strong> {selectedRoute.time}</p>
                  <p><strong>Fare:</strong> KES {selectedRoute.price}</p>
                  <p><strong>Available seats:</strong> {availableSeats.length}</p>
                  <p><strong>Payment:</strong> {bookingForm.paymentMethod === "MPESA" ? "M-Pesa" : bookingForm.paymentMethod === "CARD" ? "Card" : "Cash"}</p>
                </div>
              ) : (
                <p className="text-slate-500">Select a route to see summary.</p>
              )}
            </div>
          </section>
        )}

        {page === "my-bookings" && (
          <section>
            <h2 className="text-3xl font-bold mb-2">{user?.role === "admin" ? "All Bookings" : "My Bookings"}</h2>
            <p className="text-slate-600 mb-6">Confirmed reservation records.</p>

            {myBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-slate-600">
                No bookings found.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-5">
                {myBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} isAdmin={user?.role === "admin"} onDelete={() => deleteBooking(booking.id)} />
                ))}
              </div>
            )}
          </section>
        )}

        {page === "admin" && user?.role === "admin" && (
          <section className="grid lg:grid-cols-3 gap-6">
            <form onSubmit={addRoute} className="bg-white rounded-3xl shadow p-6 border border-slate-200 h-fit">
              <h2 className="text-2xl font-bold mb-4">Add Route</h2>

              <div className="space-y-3">
                <input className="input" placeholder="From" value={newRoute.from} onChange={(e) => setNewRoute({ ...newRoute, from: e.target.value })} />
                <input className="input" placeholder="To" value={newRoute.to} onChange={(e) => setNewRoute({ ...newRoute, to: e.target.value })} />
                <input className="input" placeholder="Price" type="number" value={newRoute.price} onChange={(e) => setNewRoute({ ...newRoute, price: e.target.value })} />
                <input className="input" placeholder="Time e.g. 08:00 AM" value={newRoute.time} onChange={(e) => setNewRoute({ ...newRoute, time: e.target.value })} />
                <input className="input" placeholder="Bus name" value={newRoute.bus} onChange={(e) => setNewRoute({ ...newRoute, bus: e.target.value })} />
                <input className="input" placeholder="Seats" type="number" value={newRoute.seats} onChange={(e) => setNewRoute({ ...newRoute, seats: e.target.value })} />

                <button className="w-full bg-blue-700 text-white py-3 rounded-2xl font-semibold">
                  ➕ Add Route
                </button>
              </div>
            </form>

            <div className="lg:col-span-2 space-y-5">
              <div className="grid md:grid-cols-3 gap-4">
                <Stat title="Routes" value={routes.length} />
                <Stat title="Bookings" value={bookings.length} />
                <Stat title="Revenue" value={`KES ${bookings.reduce((sum, b) => sum + b.amount, 0)}`} />
              </div>

              <div className="bg-white rounded-3xl shadow p-6 border border-slate-200">
                <h3 className="text-xl font-bold mb-4">Recent Bookings</h3>

                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <p className="font-semibold">{booking.passengerName}</p>
                        <p className="text-sm text-slate-500">{booking.route} • Seat {booking.seatNo}</p>
                      </div>

                      <button onClick={() => deleteBooking(booking.id)} className="text-red-600">
                        🗑️
                      </button>
                    </div>
                  ))}

                  {bookings.length === 0 && <p className="text-slate-500">No bookings yet.</p>}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="footer-section">
        <div className="footer-grid">
          <div>
            <h3>Muhembo Bus Reservation</h3>
            <p>Muhembo Bus Service provides travelers with reliable, comfortable, and convenient online bus booking.</p>
            <p className="footer-slogan">Travel Smart, Travel Muhembo</p>
          </div>

          <div>
            <div className="footer-logo">
              <span className="logo-buu">Muhembo</span>
              <span className="logo-pass">Bus</span>
            </div>

            <div className="social-icons">
              <span>◎</span>
              <span>𝕏</span>
              <span>f</span>
            </div>
          </div>

          <div>
            <h3>Booking Offices</h3>
            <p>River Road, Nairobi CBD</p>
            <p>Ticket management - 0745290192</p>
            <p>Nairobi, Kenya</p>
          </div>
        </div>
      </footer>

      <div className="chat-widget">
        {showInquiryForm ? (
          <form className="chat-form" onSubmit={submitInquiry}>
            <div className="chat-form-header">
              <strong>Leave an inquiry</strong>
              <button type="button" onClick={() => setShowInquiryForm(false)}>×</button>
            </div>

            <input placeholder="Your name" value={inquiryForm.name} onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })} />
            <input placeholder="Phone or email" value={inquiryForm.contact} onChange={(e) => setInquiryForm({ ...inquiryForm, contact: e.target.value })} />
            <textarea placeholder="Type your inquiry..." rows="3" value={inquiryForm.message} onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}></textarea>

            <button type="submit">Send Inquiry</button>
          </form>
        ) : (
          <button type="button" className="chat-bubble" onClick={() => setShowInquiryForm(true)}>
            <strong>We're offline</strong>
            <p>Leave a message</p>
          </button>
        )}

        <button type="button" className="chat-icon" onClick={() => setShowInquiryForm(!showInquiryForm)}>
          💬
        </button>
      </div>

      <style>{`
        body {
          margin: 0;
          font-family: Inter, Arial, sans-serif;
          background: #0f172a;
        }

        .app-bg {
          background:
            radial-gradient(circle at top left, rgba(255, 183, 77, 0.3), transparent 30%),
            radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.35), transparent 35%),
            linear-gradient(135deg, #f97316 0%, #ec4899 45%, #6366f1 100%);
          min-height: 100vh;
        }

        .app-bg::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px);
          background-size: 42px 42px;
          mask-image: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
        }

        button {
          cursor: pointer;
          transition: 0.2s ease;
        }

        button:hover {
          transform: translateY(-1px);
        }

        nav {
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
        }

        main {
          position: relative;
          z-index: 1;
        }

        h1, main h2 {
          color: #ffffff;
          text-shadow: 0 3px 14px rgba(15, 23, 42, 0.3);
        }

        form h2, form h3,
        .bg-white h2,
        .bg-white h3 {
          color: #0f172a;
          text-shadow: none;
        }

        .input {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 1rem;
          padding: 0.8rem 1rem;
          outline: none;
          background: #ffffff;
          color: #0f172a;
          transition: 0.2s ease;
        }

        .input:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.12);
        }

        .auth-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          background: #f1f5f9;
          padding: 0.4rem;
          border-radius: 1rem;
          margin-bottom: 1rem;
        }

        .three-tabs {
          grid-template-columns: 1fr 1fr 1fr;
        }

        .auth-tabs button {
          border: none;
          border-radius: 0.8rem;
          padding: 0.75rem;
          font-weight: 800;
          color: #475569;
        }

        .active-auth-tab {
          background: #ffffff;
          color: #1d4ed8 !important;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
        }

        .forgot-link {
          border: none;
          background: transparent;
          color: #2563eb;
          font-weight: 800;
          text-align: center;
          padding: 0.25rem;
        }

        .forgot-link:hover {
          transform: none;
          text-decoration: underline;
        }

        .admin-hint {
          background: #f8fafc;
          border: 1px dashed #94a3b8;
          color: #475569;
          font-size: 0.85rem;
          padding: 0.75rem;
          border-radius: 1rem;
          text-align: center;
        }

        .success-popup {
          position: fixed;
          top: 90px;
          right: 24px;
          z-index: 2000;
          background: #16a34a;
          color: #ffffff;
          padding: 1rem 1.2rem;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 18px 40px rgba(0,0,0,0.25);
          animation: slideIn 0.3s ease;
        }

        .password-field {
          position: relative;
        }

        .password-input {
          padding-right: 3.4rem;
        }

        .eye-button {
          position: absolute;
          right: 0.6rem;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: #f1f5f9;
          width: 2.4rem;
          height: 2.4rem;
          border-radius: 0.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .eye-button:hover {
          transform: translateY(-50%) scale(1.03);
          background: #e2e8f0;
        }

        section, form, .rounded-3xl {
          animation: fadeIn 0.35s ease-in-out;
        }

        .shadow, .shadow-lg {
          box-shadow: 0 20px 55px rgba(15, 23, 42, 0.22);
        }

        .bg-white {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
        }

        main > section > div > p,
        main > section > p {
          color: rgba(255,255,255,0.86) !important;
        }

        .footer-section {
          position: relative;
          z-index: 1;
          margin-top: 4rem;
          background: #303942;
          color: #ffffff;
          padding: 4rem 2rem;
        }

        .footer-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3rem;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #2563eb, #22c55e);
          color: #fff;
          box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          font-size: 18px;
        }

        .logo-text {
          letter-spacing: -0.5px;
          position: relative;
        }

        .nav-slogan {
          display: block;
          font-size: 0.72rem;
          font-weight: 700;
          color: #475569;
          margin-left: 0.35rem;
          letter-spacing: 0;
        }

        .logo-buu {
          color: #22c55e;
          font-weight: 900;
          letter-spacing: -0.3px;
        }

        .logo-pass {
          color: #2563eb;
          font-weight: 900;
          margin-left: -0.15rem;
        }

        .footer-logo {
          font-size: 2.7rem;
          font-weight: 900;
          margin-bottom: 1rem;
          letter-spacing: -1.5px;
        }

        .social-icons {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          font-size: 1.55rem;
          color: #db2777;
          font-weight: 900;
        }

        .social-icons span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
        }

        .footer-slogan {
          margin-top: 1rem;
          color: #fbbf24 !important;
          font-weight: 800;
        }

        .footer-section h3 {
          font-size: 1.4rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }

        .footer-section p {
          color: rgba(255,255,255,0.9);
          line-height: 1.7;
          font-size: 1rem;
        }

        .chat-widget {
          position: fixed;
          bottom: 20px;
          left: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
          z-index: 1000;
        }

        .chat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: #f97316;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }

        .chat-bubble {
          background: white;
          border: none;
          border-radius: 12px;
          padding: 10px 14px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          font-size: 14px;
          text-align: left;
        }

        .chat-bubble strong {
          display: block;
          color: #111827;
        }

        .chat-bubble p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        .chat-form {
          width: 280px;
          background: #ffffff;
          border-radius: 18px;
          padding: 1rem;
          box-shadow: 0 18px 45px rgba(0,0,0,0.25);
          display: grid;
          gap: 0.7rem;
        }

        .chat-form-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #111827;
        }

        .chat-form-header button {
          border: none;
          background: #f1f5f9;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          font-size: 1.2rem;
          line-height: 1;
        }

        .chat-form input,
        .chat-form textarea {
          width: 100%;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 0.7rem;
          outline: none;
          font-family: inherit;
        }

        .chat-form input:focus,
        .chat-form textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .chat-form button[type="submit"] {
          border: none;
          background: #2563eb;
          color: white;
          border-radius: 12px;
          padding: 0.75rem;
          font-weight: 800;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          h1 {
            font-size: 2.4rem !important;
          }

          main {
            padding-top: 1.2rem !important;
          }

          .chat-widget {
            left: 10px;
            right: 10px;
            bottom: 14px;
          }

          .chat-form {
            width: calc(100vw - 100px);
          }
        }
      `}</style>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white/10 rounded-2xl p-3">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-blue-100">{label}</p>
    </div>
  );
}

function ActionCard({ icon, title, text, onClick }) {
  return (
    <button onClick={onClick} className="text-left bg-white rounded-3xl shadow p-6 border border-slate-200 hover:shadow-lg transition">
      <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-600">{text}</p>
    </button>
  );
}

function RouteCard({ route, onBook }) {
  return (
    <div className="bg-white rounded-3xl shadow p-6 border border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-bold">{route.from} → {route.to}</h3>
          <p className="text-slate-600 mt-1">🚌 {route.bus}</p>
        </div>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          KES {route.price}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm mb-5">
        <p>📅 {route.time}</p>
        <p>📍 {route.seats} seats</p>
      </div>

      <button onClick={onBook} className="w-full bg-blue-700 text-white py-3 rounded-2xl font-semibold">
        Book This Route
      </button>
    </div>
  );
}

function BookingCard({ booking, isAdmin, onDelete }) {
  return (
    <div className="bg-white rounded-3xl shadow p-6 border border-slate-200">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-sm text-slate-500">Ticket No: MBR-{booking.id}</p>
          <h3 className="text-2xl font-bold">{booking.route}</h3>
        </div>

        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
          {booking.status}
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-3 text-sm">
        <p><strong>Passenger:</strong> {booking.passengerName}</p>
        <p><strong>Phone:</strong> {booking.phone}</p>
        <p><strong>Bus:</strong> {booking.bus}</p>
        <p><strong>Seat:</strong> {booking.seatNo}</p>
        <p><strong>Date:</strong> {booking.travelDate}</p>
        <p><strong>Time:</strong> {booking.time}</p>
        <p><strong>Amount:</strong> KES {booking.amount}</p>
        <p><strong>Payment:</strong> {booking.paymentMethod === "MPESA" ? "M-Pesa" : booking.paymentMethod === "CARD" ? "Card" : "Cash"}</p>
        <p><strong>Payment Status:</strong> {booking.paymentStatus}</p>
      </div>

      {isAdmin && (
        <button onClick={onDelete} className="mt-5 text-red-600 font-semibold">
          🗑️ Delete Booking
        </button>
      )}
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="bg-white rounded-3xl shadow p-5 border border-slate-200">
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
