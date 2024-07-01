import { Controller, Get, Post, Body, Patch, Param, Delete, ParseFilePipe, UploadedFile, UseInterceptors, MaxFileSizeValidator, FileTypeValidator, HttpStatus, UploadedFiles } from '@nestjs/common';
import { FilesService } from './files.service';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(FilesInterceptor('file') )
  uploadeProductImage(
    @UploadedFiles(
      new ParseFilePipe({
        validators:[
           new MaxFileSizeValidator({maxSize: 1000000}),
           new FileTypeValidator({fileType:  /\.(jpg|jpeg|png|sheet)$/}),
  
        ]
      })
    )   files: Array<Express.Multer.File>,
  ){
    console.log("llego una imagen")
    files.forEach(file => console.log(file.mimetype))
    return files;
  }

}
