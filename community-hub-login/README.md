# Community Hub — Login Flow

A React recreation of the Community Hub auth flow (Login, Sign Up, Verify Email,
Forgot Password, Reset Password), built with **class components**.

## Structure

```
src/
  App.jsx                        <- the "mainframe": owns which screen is shown
                                     and imports every class component below
  App.css                        <- all visual styling
  index.css                      <- global reset + page background
  main.jsx                       <- React entry point
  components/
    CommunityHubLogo.jsx         <- the orbiting "C" mark (hero + card sizes)
    LoginForm.jsx                <- class component
    SignupForm.jsx               <- class component
    VerifyEmailForm.jsx          <- class component
    ForgotPasswordForm.jsx       <- class component
    ResetPasswordForm.jsx        <- class component
```

`App.jsx` is the mainframe: it keeps `this.state.view` ('login' | 'signup' |
'verify' | 'forgot' | 'reset') and renders the matching class component,
passing it an `onNavigate` callback so each screen can switch to the next one
(e.g. "Forgot Password?" → forgot screen, "Back to Login" → login screen).

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (usually http://localhost:5173).

## Build for production

```bash
npm run build
```

## Notes

- All form fields are controlled inputs backed by `this.state` in each class
  component; `handleSubmit` currently just logs to the console — wire it up
  to your real API.
- The verification code screen auto-advances focus between the 6 digit boxes.
