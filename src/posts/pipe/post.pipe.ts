import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  NotFoundException,
} from '@nestjs/common';
import { PostsService } from '../posts.service';

@Injectable()
export class PostPipe implements PipeTransform {
  constructor(private postService: PostsService) {}

  transform(
    value: string | number,
    metadata: ArgumentMetadata,
  ): string | number {
    // Example: Validate if post with given id exists (for route params)
    if (metadata.type === 'param' && metadata.data === 'id') {
      const postId = Number(value);
      const post = this.postService.findById(postId);
      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }
      return postId;
    }
    return value;
  }
}
