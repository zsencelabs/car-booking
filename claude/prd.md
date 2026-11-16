# PRD — Multi-Sided Car Booking & Transportation Marketplace

**Product Type:** Web-based transportation marketplace  
**Initial Market:** United States  
**Product Stage:** MVP → Scalable platform  
**Business Model:** 20% platform commission on completed rides  
**Primary Users:** Customers, individual drivers, car providers, fleet companies, platform administrators

---

# 1. Product Overview

## 1.1 Product Vision

Build a comprehensive online car booking marketplace that connects customers who need transportation with independent drivers, individual car owners, and professional car rental/fleet companies.

The platform will operate as both:

1. A third-party marketplace connecting independent transportation providers with customers.
2. A first-party transportation provider operating its own fleet of vehicles and employed or contracted drivers.

The platform must support independent drivers looking for available transportation jobs, companies managing their vehicles and drivers, and customers booking reliable transportation services.

The goal is to establish a scalable transportation ecosystem where multiple vehicle providers can operate under one platform.

## 1.2 Core Business Objectives

- Build a centralized car booking marketplace.
- Allow individual drivers to discover and accept available transportation jobs.
- Allow car companies to register, manage fleets, and invite drivers.
- Enable providers to assign drivers to their registered vehicles.
- Allow the platform to operate its own fleet.
- Automatically calculate the platform's 20% commission.
- Distribute the remaining 80% to the responsible car provider.
- Support driver earnings, tips, ratings, and payout management.
- Maintain strict driver, vehicle, company, and insurance verification.
- Build a scalable architecture supporting multiple US states and cities.

# 2. User Roles & Account Types

The platform will have four primary user-facing account categories.

## 2.1 Customer

Customers can:
- Register and manage their accounts.
- Search for available transportation.
- Enter pickup and destination addresses.
- Select pickup dates and times.
- Choose available vehicle categories.
- View estimated ride prices.
- Book transportation.
- Pay after ride completion.
- View booking history.
- Track ride status.
- View assigned driver and vehicle information.
- Contact support.
- Rate drivers and vehicles separately.
- Leave reviews.
- Provide optional driver tips.
- Report safety issues.

## 2.2 Individual Driver

An individual driver can join the marketplace independently without owning a vehicle or registering a transportation company.

Drivers can:
- Register as individual drivers.
- Submit identity and driving documents.
- Complete required background verification.
- Complete vehicle-related verification where applicable.
- Browse available jobs.
- Accept or reject available jobs.
- View job details and estimated earnings.
- Communicate with customers where permitted.
- Manage active and completed rides.
- View earnings and transaction history.
- View platform tips credited to their account.
- Request eligible payouts.
- Manage availability.
- Receive ratings and reviews.
- Manage personal information and documents.

**Important:** An individual driver must have an approved vehicle assignment before performing a ride. A driver cannot independently accept a job without a vehicle that is approved and available for that booking.

Vehicle access may come from:
- A registered car company.
- An individual vehicle provider.
- The platform's own fleet.

## 2.3 Car Provider / Fleet Company

A car provider is a business or individual entity that registers one or more vehicles and offers them for transportation services.

Car providers can:

### Company management
- Register a company account.
- Submit business registration documents.
- Submit tax and insurance documentation.
- Manage company profile.
- Add business contact information.
- Add payout account details.
- Manage company employees and authorized users.

### Vehicle management
- Register multiple vehicles.
- Upload vehicle photographs.
- Submit registration and insurance documents.
- Add vehicle specifications.
- Define vehicle categories.
- Set vehicle availability.
- Manage vehicle status.
- Assign and unassign drivers.
- View vehicle booking history.

### Driver management
- Invite drivers through email.
- Send driver registration invitations.
- View invited drivers.
- View driver verification status.
- Approve or assign eligible drivers.
- Assign drivers to specific vehicles.
- Remove drivers from company assignments.
- View driver performance and ratings.

### Financial management
- View total completed ride revenue.
- View the platform's 20% commission.
- View the company's 80% earnings.
- Configure driver compensation.
- View driver payment records.
- Manage payouts.
- View transaction history.
- Download financial reports.

### Driver compensation configuration

The company controls how much of its 80% revenue share it pays to its drivers.

Supported compensation methods:

- Percentage-based payment.
- Fixed amount per completed ride.
- Custom compensation agreement.
- Zero driver compensation where legally permissible and where the arrangement is lawful.

The platform must calculate and record driver compensation separately from the platform commission.

The provider remains responsible for complying with applicable employment, wage, tax, and contractor requirements.

## 2.4 Platform Administrator

The administrator controls the entire platform.

Admin capabilities include:

- Dashboard and business analytics.
- Customer management.
- Driver management.
- Company management.
- Vehicle management.
- Booking management.
- Payment and commission management.
- Driver payout management.
- Tip transaction management.
- Document verification.
- Background verification status monitoring.
- Company approval and suspension.
- Driver approval and suspension.
- Vehicle approval and suspension.
- Pricing management.
- Service area management.
- Dispute management.
- Refund management.
- Ratings and review moderation.
- Notifications management.
- Platform settings.
- Audit logs.
- Compliance reporting.

The admin must also be able to register and manage platform-owned vehicles and drivers.

# 3. Core Business Model & Revenue Distribution

## 3.1 Standard Commission Structure

Every successfully completed third-party ride follows this distribution:

- Platform: 20%.
- Car provider: 80%.

Example:

Customer pays $100 for a completed ride.

| Recipient | Amount |
|---|---:|
| Platform commission (20%) | $20 |
| Car provider (80%) | $80 |
| Total | $100 |

The provider receives the 80% share, subject to applicable payment fees, taxes, refunds, and contractual adjustments.

## 3.2 Driver Compensation

The car provider determines the driver's compensation from its 80% share.

Example:

| Description | Amount |
|---|---:|
| Customer payment | $100 |
| Platform commission | $20 |
| Provider earnings | $80 |
| Driver compensation (75% of provider share) | $60 |
| Provider retained amount | $20 |

The provider may configure its compensation agreement independently.

The system must support percentage-based and fixed-per-ride compensation.

## 3.3 Platform-Owned Fleet

The platform must be able to operate as its own car provider.

For platform-owned rides:
- The platform owns or legally controls the vehicle.
- The platform assigns its own approved drivers.
- The platform receives the full ride revenue.
- Internal accounting may display the standard 20/80 split for analytical consistency, but the 80% is not paid to an external provider.
- Driver compensation follows the platform's own employment or contractor agreement.

## 3.4 Driver Tips

Tips are separate from ride commission.

Requirements:
- Customers can optionally tip after ride completion.
- Customers can select suggested tip amounts or enter a custom amount.
- 100% of the tip amount is allocated to the designated driver, subject to applicable payment fees and legal requirements.
- Tips must be recorded separately.
- Tips must not increase the provider's 80% share or the platform's 20% commission.
- Drivers can view accumulated tips in their dashboard.
- Drivers can see individual tip transactions.
- Tip payouts must be traceable.
- The platform must not use driver tips as operating revenue.

# 4. Customer Booking Workflow

## 4.1 Booking Process

1. Customer opens the website.
2. Enters pickup location.
3. Enters destination.
4. Selects booking date and time.
5. Selects a vehicle category.
6. Views available vehicles and estimated prices.
7. Selects a vehicle/service.
8. Reviews booking information.
9. Provides payment details.
10. Confirms the booking.
11. Platform searches for an eligible vehicle and driver.
12. Driver/provider accepts or confirms the booking.
13. Customer receives booking confirmation.
14. Driver arrives at pickup location.
15. Ride starts after customer verification.
16. Driver completes the ride.
17. Customer is charged.
18. Earnings are allocated.
19. Customer rates the driver and vehicle.
20. Customer may provide a tip.

## 4.2 Booking Types

MVP:
- Immediate booking.
- Scheduled booking.
- One-way trip.
- Round-trip booking.

Future:
- Hourly booking.
- Airport transfer.
- Long-distance booking.
- Multiple-stop journeys.
- Corporate transportation bookings.

## 4.3 Booking Status

- Pending
- Searching for provider
- Awaiting provider acceptance
- Driver assigned
- Confirmed
- Driver on the way
- Driver arrived
- Ride in progress
- Completed
- Payment pending
- Paid
- Cancelled
- Disputed
- Refunded

# 5. Driver Job Marketplace

This is one of the platform's most important differentiating features.

Individual drivers should be able to log in and discover available transportation opportunities.

## 5.1 Job Discovery

Drivers can see eligible jobs based on:
- Location.
- Pickup distance.
- Vehicle category.
- Vehicle availability.
- Driver verification status.
- Driver eligibility.
- Required vehicle specifications.

Job cards should display:
- Pickup location.
- Destination.
- Scheduled time.
- Estimated trip duration.
- Estimated distance.
- Vehicle requirements.
- Estimated driver compensation, when configured and available.
- Booking type.

## 5.2 Job Acceptance

- Drivers can accept available jobs.
- A job must not be assigned to multiple drivers.
- The system must prevent conflicting assignments.
- Accepted jobs become unavailable to other drivers.
- Drivers can see their assigned jobs.
- Job cancellation must follow platform policies.
- Driver acceptance and assignment events must be recorded.

## 5.3 Company Driver Invitations

Car companies can invite drivers using their email addresses.

Workflow:
1. Company enters the driver's email.
2. Platform generates a secure invitation.
3. Driver receives an invitation.
4. Driver creates an account or logs in.
5. Driver completes verification.
6. Driver accepts the company invitation.
7. Company can assign approved vehicles.
8. Driver becomes an associated company driver.

A driver may potentially work with multiple providers, subject to vehicle assignments, scheduling conflicts, and local regulations.

# 6. Vehicle Management

Every registered vehicle must have a unique platform record.

## 6.1 Vehicle Information

Required fields:
- Make.
- Model.
- Year.
- VIN.
- License plate number.
- Vehicle color.
- Vehicle category.
- Passenger capacity.
- Luggage capacity.
- Registration state.
- Registration expiration date.
- Insurance provider.
- Insurance policy number.
- Insurance expiration date.
- Vehicle photographs.

## 6.2 Vehicle Categories

Initial categories:
- Economy.
- Comfort.
- Premium.
- SUV.
- Luxury.
- Van.

Vehicle eligibility and categories must be configurable by administrators.

## 6.3 Vehicle Status

- Draft.
- Pending verification.
- Approved.
- Available.
- Assigned.
- On trip.
- Temporarily unavailable.
- Maintenance.
- Rejected.
- Suspended.
- Expired documents.

A vehicle must never be bookable when its required documents are expired or its approval is suspended.

# 7. Verification & Compliance

The platform will initially target the United States.

Compliance must be designed around federal, state, county, city, and service-specific transportation requirements.

**Important:** The United States does not have one universal car-booking or rideshare licensing checklist. Requirements differ by jurisdiction and operating model. The platform must use configurable compliance rules rather than assuming one document list applies everywhere.

## 7.1 Individual Driver Documents

Required information and verification records should include:

- Legal full name.
- Date of birth.
- Residential address.
- Government-issued identification.
- Valid driver's license.
- Driving history / motor vehicle record (MVR).
- Criminal background check.
- National sex offender registry check where required.
- Driver photograph.
- Proof of work authorization where legally required.
- Additional local permits or chauffeur licenses where applicable.
- Drug and alcohol screening where required.
- Emergency contact.

## 7.2 Car Provider Documents

Required depending on business type and jurisdiction:

- Business registration.
- EIN or relevant tax identification.
- Legal business name.
- Business address.
- Authorized representative information.
- Business license or transportation operating authority.
- Commercial insurance.
- Tax documentation.
- Payment account verification.
- Applicable local permits.

## 7.3 Vehicle Documents

- Vehicle registration.
- Proof of ownership or authorization to operate.
- Commercial or approved transportation insurance.
- Vehicle inspection certificate.
- Vehicle identification number.
- License plate information.
- Required permits and operating licenses.
- Accessibility certification where applicable.

## 7.4 Compliance Management

The system must:
- Track document expiration dates.
- Send expiration reminders.
- Automatically flag expired documents.
- Prevent non-compliant vehicles from receiving bookings.
- Prevent non-compliant drivers from accepting jobs.
- Maintain verification history.
- Maintain approval and rejection reasons.
- Store verification timestamps.
- Support manual and third-party verification.
- Maintain audit logs.

## 7.5 Safety Requirements

- Background checks must be completed through compliant providers.
- Sensitive identity documents must be encrypted and access-controlled.
- Driver and vehicle information must be visible to customers before the ride.
- Emergency support must be accessible during rides.
- Customers must be able to report incidents.
- Drivers must be able to report customer safety incidents.
- Safety complaints must create trackable cases.
- Suspended users must lose access to relevant platform operations.

# 8. Payments & Financial Management

## 8.1 Payment Processing

The platform should use a marketplace-capable payment processor, such as Stripe Connect, subject to availability and eligibility for the operating business.

Payment lifecycle:

1. Customer adds a valid payment method.
2. Platform authorizes an appropriate payment amount before the ride, where supported.
3. Ride is completed.
4. Final fare is calculated.
5. Customer payment is captured.
6. Platform calculates commission.
7. Provider earnings are allocated.
8. Driver compensation is calculated according to the provider agreement.
9. Eligible earnings become payable.
10. Driver tips are recorded separately.

The product requirement is pay-after-ride. Card authorization before the ride is a payment safeguard, not a final customer charge.

Cash payments should be considered a separate future payment method because commission collection and provider settlement become more complicated.

## 8.2 Provider Wallet

Provider dashboard must display:
- Total revenue.
- Completed ride revenue.
- Platform commission.
- Pending earnings.
- Available balance.
- Paid amount.
- Refunds and adjustments.
- Driver compensation.
- Payout history.

## 8.3 Driver Wallet

Driver dashboard must display:
- Total completed rides.
- Gross compensation.
- Pending compensation.
- Available earnings.
- Received payouts.
- Tips received.
- Tip payout status.
- Transaction history.

The wallet is an accounting ledger, not a substitute for a legally compliant stored-value or money-transmission service.

## 8.4 Financial Ledger

Every financial operation must have a traceable transaction record.

Use immutable financial transaction entries with:
- Transaction ID.
- Booking ID.
- Customer ID.
- Provider ID.
- Driver ID.
- Gross fare.
- Commission.
- Provider allocation.
- Driver compensation.
- Tip amount.
- Payment processing fees.
- Refund adjustments.
- Payment status.
- Payout status.
- Created timestamp.

Never calculate financial balances solely from frontend values.

# 9. Ratings & Reviews

Customers can independently rate:

**Driver**
- Professionalism.
- Driving experience.
- Communication.
- Overall rating.

**Vehicle**
- Cleanliness.
- Comfort.
- Condition.
- Overall rating.

Additional requirements:
- Only customers with completed rides can submit ratings.
- One rating per eligible ride per category.
- Customers can edit ratings within a configurable period.
- Reviews can be reported.
- Admin can moderate inappropriate content.
- Driver and vehicle ratings are calculated separately.

# 10. Web Application Modules

## 10.1 Public Website

- Homepage.
- How it works.
- Vehicle/service categories.
- Booking interface.
- About us.
- Contact.
- Safety information.
- Help center.
- Terms and conditions.
- Privacy policy.
- Driver registration.
- Provider registration.

## 10.2 Customer Dashboard

- Overview.
- Book a ride.
- Upcoming bookings.
- Active booking.
- Booking history.
- Payment methods.
- Receipts.
- Ratings and reviews.
- Support.
- Profile and settings.

## 10.3 Driver Dashboard

- Overview.
- Available jobs.
- My jobs.
- Active ride.
- Earnings.
- Tips.
- Payouts.
- Ratings.
- Documents.
- Availability.
- Company invitations.
- Profile and settings.

## 10.4 Provider Dashboard

- Overview.
- Fleet management.
- Add vehicle.
- Vehicle availability.
- Driver management.
- Invite drivers.
- Driver assignments.
- Bookings.
- Revenue.
- Commission.
- Driver compensation.
- Payouts.
- Documents.
- Company settings.

## 10.5 Admin Dashboard

- Platform overview.
- Customers.
- Drivers.
- Providers.
- Platform fleet.
- Vehicles.
- Bookings.
- Payments.
- Financial ledger.
- Commission management.
- Driver compensation monitoring.
- Tips.
- Payouts.
- Compliance and verification.
- Safety and disputes.
- Ratings and reviews.
- Service areas.
- Pricing.
- Reports.
- Audit logs.
- Platform configuration.

# 11. Notifications

Supported channels:
- Email.
- In-app notifications.
- SMS for critical booking and safety events.

Important notifications:

Customer:
- Booking confirmation.
- Driver assignment.
- Driver arrival.
- Ride completion.
- Payment receipt.
- Cancellation.
- Refund.

Driver:
- New job availability.
- Job assignment.
- Job cancellation.
- Company invitation.
- Document expiration.
- Payment received.
- New rating.

Provider:
- New booking.
- Driver assignment.
- Vehicle document expiration.
- New driver invitation acceptance.
- Payout updates.

Admin:
- New provider registration.
- New driver registration.
- Document verification requests.
- Reported safety incidents.
- Payment failures.
- Disputes.
- Suspicious activities.

# 12. Non-Functional Requirements

## Security
- Role-based access control (RBAC).
- Multi-factor authentication for privileged accounts.
- Secure session management.
- Encryption in transit and at rest.
- Secure document storage.
- Audit logging.
- Rate limiting.
- Input validation.
- Protection against common OWASP web vulnerabilities.
- Secure payment integration.
- No storage of raw card information.

## Performance
- Responsive web interface.
- Fast booking experience.
- Efficient vehicle and driver discovery.
- Background processing for notifications and payouts.
- Optimized database queries.
- Scalable API architecture.

## Reliability
- Transaction-safe financial operations.
- Idempotent payment processing.
- Atomic job acceptance.
- Booking conflict prevention.
- Retry mechanisms for external integrations.
- Payment reconciliation.
- Database backups.
- Monitoring and error tracking.

## Privacy
- Data minimization.
- Consent management.
- Role-based document access.
- Retention and deletion policies.
- Privacy-compliant background check processing.
- Location data access controls.

# 13. Suggested Technical Architecture

The platform should be designed as a modular, API-first application.

Suggested architecture:

- Frontend: Next.js + TypeScript.
- Backend: NestJS + TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Cache and queues: Redis + BullMQ.
- Authentication: Secure session-based authentication or an established identity provider.
- Payments: Stripe Connect or another eligible marketplace payment provider.
- Maps and geocoding: Google Maps Platform or Mapbox.
- Email: Resend.
- SMS: Twilio.
- File storage: AWS S3-compatible object storage.
- Monitoring: Sentry.
- Infrastructure: Docker-based deployment.

Core backend domains:
- Identity and authentication.
- Customer management.
- Driver management.
- Provider management.
- Fleet and vehicles.
- Driver-vehicle assignments.
- Booking and dispatch.
- Pricing.
- Payments.
- Financial ledger.
- Tips and payouts.
- Ratings and reviews.
- Compliance.
- Notifications.
- Support and safety.
- Audit logs.

Architecture should prioritize clear domain boundaries, transactional consistency, and extensibility rather than premature microservices.

# 14. MVP Scope

The first release should prioritize a reliable booking and transportation operation.

### Must Have — MVP

1. Public website.
2. Customer registration and authentication.
3. Customer ride booking.
4. Individual driver registration.
5. Driver verification workflow.
6. Car provider registration.
7. Company verification workflow.
8. Vehicle registration and verification.
9. Company driver invitations.
10. Driver-vehicle assignment.
11. Driver job discovery and acceptance.
12. Booking management.
13. Platform-owned fleet management.
14. 20/80 revenue allocation.
15. Provider-controlled driver compensation.
16. Post-ride payment capture.
17. Driver tips.
18. Provider and driver dashboards.
19. Admin dashboard.
20. Separate driver and vehicle ratings.
21. Document expiration monitoring.
22. Email and booking notifications.
23. Safety reporting.
24. Financial transaction ledger.

### Should Have — After MVP

- Live GPS tracking.
- Real-time driver location.
- Advanced dispatch algorithm.
- Dynamic pricing.
- Automated background-check integrations.
- Automated vehicle inspection verification.
- SMS notifications.
- Refund automation.
- Advanced analytics.
- Corporate accounts.

### Future Development

- Native Android and iOS applications.
- Corporate transportation.
- Subscription packages for providers.
- Multi-city expansion.
- Loyalty programs.
- Advanced fraud detection.
- AI-assisted dispatch.
- Accessibility-focused transportation options.

# 15. Key Business Rules

1. Only verified customers can book rides.
2. Only approved drivers can accept and perform rides.
3. Only approved vehicles can be assigned to rides.
4. A vehicle cannot be assigned to overlapping bookings.
5. A driver cannot accept conflicting jobs.
6. A driver must have an eligible vehicle assignment.
7. Every booking must have an identifiable provider.
8. Every completed third-party ride generates a 20% platform commission.
9. The provider receives the remaining 80%, subject to adjustments.
10. Driver compensation is calculated according to the provider's agreement.
11. Platform-owned fleet revenue remains within the platform business.
12. Driver tips are accounted for separately.
13. Customers can only rate completed rides.
14. Expired mandatory documents automatically trigger compliance restrictions.
15. Admin actions involving financial or compliance records must be auditable.
16. No payment or payout should be processed twice for the same transaction.
17. Cancelled rides must follow configurable cancellation and refund policies.
18. All financial calculations must be performed on the backend.

# 16. Success Metrics

Business:
- Monthly completed rides.
- Gross booking value.
- Platform commission revenue.
- Active providers.
- Active drivers.
- Active vehicles.
- Average booking value.
- Provider retention.

Operational:
- Booking acceptance rate.
- Average driver assignment time.
- Ride completion rate.
- Cancellation rate.
- Payment success rate.
- Average pickup delay.
- Safety incidents per completed ride.

Customer:
- Customer retention.
- Repeat booking rate.
- Customer rating.
- Customer support resolution time.

Provider:
- Active fleet utilization.
- Driver utilization.
- Provider retention.
- Average provider earnings.

# 17. Critical Product Decisions

Before production implementation, the following must be finalized:

1. Launch state and city.
2. Whether the platform will operate as a Transportation Network Company (TNC), licensed transportation broker, carrier, or another applicable legal category.
3. Whether the platform will onboard individual vehicle owners as well as companies.
4. Whether providers can accept bookings automatically or manually.
5. Whether individual drivers can select vehicles from a shared marketplace or must first establish an approved provider relationship.
6. Exact payment settlement and payout schedule.
7. Driver compensation agreements and worker classification.
8. Cancellation and refund policies.
9. Insurance responsibilities for each operating model.
10. Applicable state and local licensing requirements.

**Product principle:** No driver, vehicle, provider, or booking should become operational until all applicable legal and safety requirements for its operating jurisdiction have been satisfied.

---

**End of PRD — Version 1.0**