export const fileFilter =(req: Express.Request, file: Express.Multer.File, cd:Function )=>{
  console.log(file);
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    console.log("paso el filtro")
    cd(null, true);

  }else cd(null, false);
  console.log("no paso el filtro")

  // cd(null, true)


}