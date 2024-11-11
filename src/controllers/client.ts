import { Client, Device, GasMapping, User } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import {
  IClient,
  IClientDto,
  IDevice,
  IGasMapping,
  IGasMappingDto,
  IUser,
} from "types/mongodb";
import { ulid } from "ulid";
import { CustomError } from "utils/response/custom-error/CustomError";

export const createClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientData = req.body;
    const existingClient = await Client.findOne({
      name: clientData.name,
    }).lean();
    if (existingClient) {
      const customError = new CustomError(
        500,
        "General",
        "Client already exists"
      );
      return next(customError);
    }
    const base64Data = clientData.logo.replace(/^data:(image\/\w+);base64,/, '');
    const mimeType = clientData.logo ? clientData.logo.match(/^data:(image\/\w+);base64/)[1] : undefined;
    const logoBuffer = clientData.logo ?  Buffer.from(base64Data, 'base64') : undefined;
    const createdClient = await Client.create({
      id: ulid(),
      name: clientData.name,
      logo: logoBuffer,
      logoMimeType: mimeType,
      address: clientData.address,
      email: clientData.email,
      phone: clientData.phone,
      website: clientData.website,
      showBanner: false,
      bannerMessage: "",
      bannerLink: ""
    });
    await GasMapping.create({
      id: ulid(),
      gas1: "Gas 1",
      gas2: "Gas 2",
      gas3: "Gas 3",
      gas4: "Gas 4",
      gas5: "Gas 5",
      gas6: "Gas 6",
      clientId: createdClient.id,
    });
    return res.customSuccess(200, "Client Created successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot create client",
      null,
      err
    );
    return next(customError);
  }
};

export const updateClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => { 
  try {
    const clientId = req.body.id;
    const clientData = req.body;
    const base64Data = clientData.logo.replace(/^data:(image\/\w+);base64,/, '');
    const mimeType = clientData.logo ? clientData.logo.match(/^data:(image\/\w+);base64/)[1] : undefined;
    const logoBuffer = clientData.logo ?  Buffer.from(base64Data, 'base64') : undefined;
    await Client.updateOne(
      { id: clientId },
      {name: clientData.name,
        logo: logoBuffer,
        logoMimeType: mimeType,
        address: clientData.address,
        email: clientData.email,
        phone: clientData.phone,
        website: clientData.website }
    );
    return res.customSuccess(200, "Client Updated successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot update client",
      null,
      err
    );
    return next(customError);
  }
}

export const updateGasMapping = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const gasMapping: IGasMappingDto = req.body;
    await GasMapping.updateOne(
      { clientId: gasMapping.clientId },
      {
        gas1: gasMapping.gas1,
        gas2: gasMapping.gas2,
        gas3: gasMapping.gas3,
        gas4: gasMapping.gas4,
        gas5: gasMapping.gas5,
        gas6: gasMapping.gas6,
      }
    );
    return res.customSuccess(200, "Client Gas Mapping updated successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot update client gas mapping",
      null,
      err
    );
    return next(customError);
  }
};

export const updateBannerMsg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banner: any = req.body;
    const clientId = banner.id;
    if (!clientId) {
      const customError = new CustomError(
        500,
        "General",
        "Client ID not found"
      );
      return next(customError);
    }
    if (banner.bannerMessage)
      await Client.updateOne(
        { id: banner.id },
        {
          bannerMessage: banner.bannerMessage,
          showBanner: banner.showBanner,
          bannerLink: banner.bannerLink,
        }
      );
    if (!banner.bannerMessage)
      await Client.updateOne(
        { id: banner.id },
        {
          showBanner: banner.showBanner,
        }
      );
    return res.customSuccess(
      200,
      "Client Banner updated successfully"
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot update banner data",
      null,
      err
    );
    return next(customError);
  }
};

export const getClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clientId = req.params.id;
    if (!clientId) {
      const customError = new CustomError(
        500,
        "General",
        "Client ID not found"
      );
      return next(customError);
    }
    const client: IClient | null = await Client.findOne({
      id: clientId,
    }).lean();
    if (!client) {
      const customError = new CustomError(500, "General", "Client not found");
      return next(customError);
    }
    const clientUsers: IUser[] = await User.find({ clientId }).lean();
    const clientDevices: IDevice[] = await Device.find({ clientId }).lean();
    const gasMapping = await GasMapping.findOne({ clientId }).lean();
    const clientDetailsToBeSent: IClientDto = {
      id: client.id,
      address: client.address,
      createdAt: client.createdAt,
      email: client.email,
      logo: client.logo ? `data:${client.logoMimeType};base64,${client.logo.toString('base64')}`: '',
      name: client.name,
      phone: client.phone,
      updatedAt: client.updatedAt,
      website: client.website,
      showBanner: client.showBanner,
      bannerLink: client.bannerLink,
      bannerMessage: client.bannerMessage,
      devices: clientDevices.map((device) => ({
        id: device.id,
        clientId: device.clientId,
        createdAt: device.createdAt,
        identifier: device.identifier,
        location: device.location,
        modelType: device.modelType,
        name: device.name,
        status: device.status,
        updatedAt: device.updatedAt,
      })),
      users: clientUsers.map((user) => ({
        id: user.id,
        clientId: user.clientId,
        createdAt: user.createdAt,
        deactivated: user.deactivated,
        email: user.email,
        name: user.email,
        password: user.password,
        role: user.role,
        updatedAt: user.updatedAt,
      })),
      gasMapping: gasMapping === null ? undefined : gasMapping,
    };
    return res.customSuccess(
      200,
      "Client Fetched successfully",
      clientDetailsToBeSent
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot fetch client",
      null,
      err
    );
    return next(customError);
  }
};

export const getAllClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const clients: IClient[] = await Client.find().lean();
    const clientUsers: IUser[] = await User.find({
      clientId: { $in: clients.map((c) => c.id) },
    }).lean();
    const clientDevices: IDevice[] = await Device.find({
      clientId: { $in: clients.map((c) => c.id) },
    }).lean();
    const gasMappings: IGasMapping[] = await GasMapping.find({
      clientId: { $in: clients.map((c) => c.id) },
    }).lean();
    const clientDetailsToBeSent: IClientDto[] = clients.map((client) => {
      const devices = clientDevices
        .filter((d) => d.clientId === client.id)
        .map((device) => ({
          id: device.id,
          clientId: device.clientId,
          createdAt: device.createdAt,
          identifier: device.identifier,
          location: device.location,
          modelType: device.modelType,
          name: device.name,
          status: device.status,
          updatedAt: device.updatedAt,
        }));
      const users = clientUsers
        .filter((u) => u.clientId === client.id)
        .map((user) => ({
          id: user.id,
          clientId: user.clientId,
          createdAt: user.createdAt,
          deactivated: user.deactivated,
          email: user.email,
          name: user.email,
          password: user.password,
          role: user.role,
          updatedAt: user.updatedAt,
        }));
      const gasMapping = gasMappings.find(
        (mapping) => mapping.clientId === client.id
      );
      return {
        id: client.id,
        address: client.address,
        createdAt: client.createdAt,
        email: client.email,
        logo: client.logo ? client.logo.toString("base64"):'',
        name: client.name,
        phone: client.phone,
        showBanner: client.showBanner,
        bannerLink: client.bannerLink,
        bannerMessage: client.bannerMessage,
        updatedAt: client.updatedAt,
        website: client.website,
        devices,
        users,
        gasMapping,
      };
    });
    return res.customSuccess(
      200,
      "All Client Fetched successfully",
      clientDetailsToBeSent
    );
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot fetch all client",
      null,
      err
    );
    return next(customError);
  }
};
