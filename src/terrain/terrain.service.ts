import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Terrain } from 'src/schemas/terrain.schema'; // Correct absolute path
import { CreateTerrainDto } from './dto/create-terrain.dto';
import { UpdateTerrainDto } from './dto/update-terrain.dto';

@Injectable()
export class TerrainService {
  constructor(@InjectModel(Terrain.name) private terrainModel: Model<Terrain>) {}

  // **C**REATE
  async create(createTerrainDto: CreateTerrainDto): Promise<Terrain> {
    const newTerrain = new this.terrainModel(createTerrainDto);
    return newTerrain.save();
  }

  // **R**EAD All
  findAll(): Promise<Terrain[]> {
    return this.terrainModel.find().exec();
  }

  // **R**EAD by Academy ID
  findByAcademieId(academieId: string): Promise<Terrain[]> {
    return this.terrainModel.find({ id_academie: academieId }).exec();
  }
  
  // **R**EAD One
  findOne(id: string): Promise<Terrain | null> {
    return this.terrainModel.findById(id).exec();
  }

  // **U**PDATE
  update(id: string, updateTerrainDto: UpdateTerrainDto): Promise<Terrain | null> {
    return this.terrainModel
      .findByIdAndUpdate(id, updateTerrainDto, {
        new: true,
        runValidators: true,
      })
      .exec();
  }

  // **D**ELETE
  remove(id: string): Promise<any> {
    return this.terrainModel.findByIdAndDelete(id).exec();
  }
}