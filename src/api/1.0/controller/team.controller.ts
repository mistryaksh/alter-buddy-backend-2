import { Request, Response } from "express";
import { IControllerRoutes, IController, ITeamProps } from "interface";
import { Team } from "model";
import { Ok, UnAuthorized } from "utils";

export class TeamController implements IController {
  public routes: IControllerRoutes[] = [];

  constructor() {
    this.routes.push({
      path: "/team-members",
      handler: this.GetAllTeam,
      method: "GET",
    });
    this.routes.push({
      handler: this.CreateNewTeam,
      method: "POST",
      path: "/team-members",
    });
    this.routes.push({
      handler: this.UpdateTeamMember,
      method: "PUT",
      path: "/team-members",
    });
    this.routes.push({
      handler: this.DeleteTeamMember,
      method: "DELETE",
      path: "/team-members",
    });
    this.routes.push({
      handler: this.GetTeamById,
      method: "GET",
      path: "/team-members/:id",
    });
  }
  public async GetAllTeam(req: Request, res: Response) {
    try {
      const team = await Team.find();
      return Ok(res, team);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async GetTeamById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const team = await Team.findById({ _id: id });
      return Ok(res, team);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async CreateNewTeam(req: Request, res: Response) {
    try {
      const { dept, image, name }: ITeamProps = req.body;
      if (!dept || !image || !name) {
        return UnAuthorized(res, "missing field");
      }

      const team = await Team.findOne({ name });

      if (team) {
        return UnAuthorized(res, "team member is already in database");
      }

      const newTeam = await new Team({
        dept,
        image,
        name,
      }).save();

      return Ok(res, `${name} is uploaded`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async UpdateTeamMember(req: Request, res: Response) {
    try {
      const updatedTeam = await Team.findByIdAndUpdate(
        { _id: req.params.id },
        { $set: { ...req.body } }
      );
      return Ok(res, `${updatedTeam.name} is updated`);
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }

  public async DeleteTeamMember(req: Request, res: Response) {
    try {
      await Team.findByIdAndDelete({ _id: req.params.id });
      return Ok(res, "team member deleted");
    } catch (err) {
      return UnAuthorized(res, err);
    }
  }
}
