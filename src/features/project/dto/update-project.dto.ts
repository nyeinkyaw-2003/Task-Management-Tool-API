import { PartialType } from "@nestjs/swagger";
import CreateProjectDto from "./create-project.dto";


class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export default UpdateProjectDto;