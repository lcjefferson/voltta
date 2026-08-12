import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { JwtAuthGuard, RolesGuard } from './common/guards/auth.guards';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ServicesModule } from './modules/services/services.module';
import { AutomationsModule } from './modules/automations/automations.module';
import { ScoresModule } from './modules/scores/scores.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { PublicBookingModule } from './modules/public-booking/public-booking.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { FinanceModule } from './modules/finance/finance.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BillingModule } from './modules/billing/billing.module';
import { HealthModule } from './modules/health/health.module';
import { TrialRemindersModule } from './modules/trial-reminders/trial-reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    PrismaModule,
    AuthModule,
    CompanyModule,
    UsersModule,
    CustomersModule,
    ServicesModule,
    AutomationsModule,
    ScoresModule,
    AppointmentsModule,
    PublicBookingModule,
    WhatsappModule,
    FinanceModule,
    DashboardModule,
    BillingModule,
    HealthModule,
    TrialRemindersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
