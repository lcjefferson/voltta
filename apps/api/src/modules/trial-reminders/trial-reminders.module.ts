import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from '../../providers/mail/mail.module';
import { TrialRemindersService } from './trial-reminders.service';

@Module({
  imports: [PrismaModule, MailModule],
  providers: [TrialRemindersService],
  exports: [TrialRemindersService],
})
export class TrialRemindersModule {}
