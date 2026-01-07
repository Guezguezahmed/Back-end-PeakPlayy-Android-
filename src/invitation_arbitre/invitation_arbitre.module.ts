import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvitationArbitreService } from './invitation_arbitre.service';
import { InvitationArbitreController } from './invitation_arbitre.controller';
import { InvitationArbitre, InvitationArbitreSchema } from 'src/schemas/invitation-arbitre.schema';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: InvitationArbitre.name, schema: InvitationArbitreSchema },
    ]),
  ],
  controllers: [InvitationArbitreController],
  providers: [InvitationArbitreService],
})
export class InvitationArbitreModule {}
