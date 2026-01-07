import { Module, forwardRef } from '@nestjs/common';
import { MatchService } from './match.service';
import { MatchController } from './match.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Match, MatchSchema } from 'src/schemas/match.schema';
import { Equipe, EquipeSchema } from 'src/schemas/equipe.schema';
import { User, UserSchema } from 'src/schemas/user.schemas';
import { MatchEvent, MatchEventSchema } from 'src/schemas/match-event.schema';
import { MatchStatistics, MatchStatisticsSchema } from 'src/schemas/match-statistics.schema';
import { MatchEventService } from './match-event.service';
import { MatchStatisticsService } from './match-statistics.service';
import { CoupeModule } from 'src/coupe/coupe.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Match.name, schema: MatchSchema },
      { name: Equipe.name, schema: EquipeSchema },
      { name: User.name, schema: UserSchema },
      { name: MatchEvent.name, schema: MatchEventSchema },
      { name: MatchStatistics.name, schema: MatchStatisticsSchema },
    ]),
    forwardRef(() => CoupeModule),
  ],
  controllers: [MatchController],
  providers: [MatchService, MatchEventService, MatchStatisticsService],

  exports: [
    MongooseModule,
    MatchService,
    MatchEventService,
    MatchStatisticsService,
  ],
})
export class MatchModule { }
