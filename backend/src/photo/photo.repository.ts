import { EntityRepository, Repository } from 'typeorm';
import { Photo } from './photo.entity';
import { User } from 'src/user/user.entity';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(Photo)
export class PhotoRepository extends Repository<Photo> {
  async uploadPhoto(
    key: string,
    user: User,
    photoBody: string,
  ): Promise<Photo> {
    const photo = new Photo();
    photo.body = photoBody;
    photo.key = key;
    photo.user = user;
    photo.userId = user.id;
    await photo.save();

    return photo;
  }

  async getPhotoById(id: number): Promise<Photo> {
    return this.findOne({
      where: { id },
      relations: ['user', 'likes', 'comment', 'comment.user'],
    });
  }

  async deletePhotoById(id: number): Promise<void> {
    const result = await this.delete({ id });
    if (result.affected === 0) {
      throw new NotFoundException(`Photo not found`);
    }
  }

  async getFeedPhotos(arrayUsersId) {
    return await this.createQueryBuilder('photo')
      .leftJoinAndSelect('photo.comment', 'comment')
      .leftJoinAndSelect('comment.user', 'userComment')
      .leftJoinAndSelect('photo.user', 'postedBy')
      .leftJoinAndSelect('photo.likes', 'likes')
      .where('photo.userId IN (:...arrayUsersId)', { arrayUsersId })
      .getMany();
  }

  async getAllUserPhotosCount(userId: number): Promise<number> {
    return await this.createQueryBuilder('photo')
      .where('photo.userId = :userId', {
        userId,
      })
      .getCount();
  }
}
