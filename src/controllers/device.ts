import {
  Client,
  Device,
  GasMapping,
  UserDeviceMapping,
  WeatherDataRange,
} from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { ModifiedPathsSnapshot, Document, Model, Types, ClientSession, DocumentSetOptions, QueryOptions, UpdateQuery, AnyObject, PopulateOptions, MergeType, Query, SaveOptions, ToObjectOptions, FlattenMaps, Require_id, UpdateWithAggregationPipeline, pathsToSkip, Error } from "mongoose";
import { EStatus, IClient, IGasMappingDto, IWeatherDataRange } from "types/mongodb";
import { ulid } from "ulid";
import { CustomError } from "utils/response/custom-error/CustomError";

export const registerDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, identifier, modelType, location } = req.body;
    const existingDevice = await Device.findOne({ identifier }).lean();
    if (existingDevice) {
      const customError = new CustomError(
        500,
        "General",
        "Device already exists"
      );
      return next(customError);
    }
    const deviceId = ulid();
    const device = await Device.create({
      id: deviceId,
      modelType,
      identifier,
      location: location || "",
      name: name || identifier,
      clientId: null,
      status: EStatus.REGISTERED,
    });
    await WeatherDataRange.create( {
      id: ulid(),
      temperatureMin: 0,
      temperatureMax: 100,
      humidityMin: 0,
      humidityMax: 100,
      pressureMin: 0,
      pressureMax: 100,
      co2Min: 0,
      co2Max: 100,
      vocsMin: 0,
      vocsMax: 100,
      lightMin: 0,
      lightMax: 100,
      noiseMin: 0,
      noiseMax: 100,
      pm1Min: 0,
      pm1Max: 100,
      pm25Min: 0,
      pm25Max: 100,
      pm4Min: 0,
      pm4Max: 100,
      pm10Min: 0,
      pm10Max: 100,
      aiqMin: 0,
      aiqMax: 100,
      gas1Min: 0,
      gas1Max: 100,
      gas2Min: 0,
      gas2Max: 100,
      gas3Min: 0,
      gas3Max: 100,
      gas4Min: 0,
      gas4Max: 100,
      gas5Min: 0,
      gas5Max: 100,
      gas6Min: 0,
      gas6Max: 100,
      deviceId: deviceId,
      oderMin: 0,
      odorMax: 100,
      moldGrowthMin: 0,
      moldGrowthMax: 100,
    });
    return res.customSuccess(200, "Device Registered successfully", device.id);
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot register device",
      null,
      err
    );
    return next(customError);
  }
};

export const connectDeviceWithUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const deviceId = req.body.deviceId;
    const clientId = req.body.clientId;
    if (!userId) {
      const customError = new CustomError(500, "General", "User not found");
      return next(customError);
    }
    if (!deviceId) {
      const customError = new CustomError(500, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(500, "General", "Client not found");
      return next(customError);
    }
    await UserDeviceMapping.create({ id: ulid(), deviceId, userId });
    await Device.updateOne({ deviceId }, { status: EStatus.CONNECTED });
    return res.customSuccess(200, "Device connected successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};
export const connectDeviceWithClient = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deviceId = req.body.deviceId;
    const name = req.body.name;
    const modelType = req.body.modelType;
    const clientId = req.body.clientId;
    const location = req.body.location;
    if (!deviceId) {
      const customError = new CustomError(500, "General", "Device not found");
      return next(customError);
    }
    if (!clientId) {
      const customError = new CustomError(500, "General", "Client not found");
      return next(customError);
    }
    await Device.updateOne(
      { id: deviceId },
      { status: EStatus.CONNECTED, name, modelType, clientId, location }
    );
    return res.customSuccess(200, "Device connected successfully");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};

export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stateToBeUpdated = req.body.state as EStatus;
    const deviceId = req.body.deviceId;
    // validate if stateToBeUpdated is valid for current device state.
    await Device.findOneAndUpdate(
      { id: deviceId },
      { status: stateToBeUpdated }
    ).lean();
    if (stateToBeUpdated === EStatus.UNREGISTERED) {
      await UserDeviceMapping.deleteMany({ deviceId });
    }
    return res.customSuccess(200, "Device status updated Successfully.");
  } catch (err) {
    const customError = new CustomError(
      400,
      "Raw",
      "Cannot connect device",
      null,
      err
    );
    return next(customError);
  }
};

export const getAllDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const devices = await Device.find().lean();
    const devicesToBeSent = devices.map((device) => ({
      id: device.id,
      clientId: device.clientId,
      createdAt: device.createdAt,
      identifier: device.identifier,
      modelType: device.modelType,
      name: device.name,
      location: device.location,
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    return res.customSuccess(
      200,
      "Devices Fetched Successfully.",
      devicesToBeSent
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getUserDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      const customError = new CustomError(500, "General", "User not found");
      return next(customError);
    }
    const devices = await Device.find({ clientId: user.clientId }).lean();
    const client: IClient | null = await Client.findOne({
      id: user.clientId,
    }).lean();

    const devicesToBeSent = devices.map((device) => ({
      id: device.id,
      clientId: device.clientId,
      createdAt: device.createdAt,
      identifier: device.identifier,
      modelType: device.modelType,
      location: device.location,
      name: device.name,
      status: device.status,
      updatedAt: device.updatedAt,
    }));
    if (!client) {
      return res.customSuccess(200, "Devices Fetched Successfully.", {
        email: user.email,
        id: user.id,
        name: user.name,
        clientId: user.clientId,
        role: user.role,
        devices: devicesToBeSent,
      });
    }
    const gasMapping: IGasMappingDto | null = await GasMapping.findOne({
      clientId: client.id,
    });
    return res.customSuccess(200, "Devices Fetched Successfully.", {
      email: user.email,
      id: user.id,
      name: user.name,
      clientId: user.clientId,
      client: {
        id: client.id,
        name: client.name,
        logo: client.logo,
        address: client.address,
        email: client.email,
        phone: client.phone,
        website: client.website,
        showBanner: client.showBanner,
        bannerLink: client.bannerLink,
        bannerMessage: client.bannerMessage,
      },
      role: user.role,
      devices: devicesToBeSent,
      gasMapping,
    });
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const getDeviceRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const deviceId = req.query.id;
  if(!deviceId){
    const error = new CustomError(404,"General","Device not found");
    return next(error);
  }
  try {
    const deviceRange = await WeatherDataRange.findOne({
      deviceId: deviceId
    });
    return res.customSuccess(
      200,
      "Device Range Fetched Successfully",
      deviceRange
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const updateDeviceRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updatedValue = req.body;

    const deviceRange = await WeatherDataRange.updateMany(
      {
        deviceId: updatedValue.deviceId,
      },
      {
        temperatureMin: updatedValue.temperatureMin,
        temperatureMax: updatedValue.temperatureMax,
        humidityMin: updatedValue.humidityMin,
        humidityMax: updatedValue.humidityMax,
        pressureMin: updatedValue.pressureMin,
        pressureMax: updatedValue.pressureMax,
        co2Min: updatedValue.co2Min,
        co2Max: updatedValue.co2Max,
        vocsMin: updatedValue.vocsMin,
        vocsMax: updatedValue.vocsMax,
        lightMin: updatedValue.lightMin,
        lightMax: updatedValue.lightMax,
        noiseMin: updatedValue.noiseMin,
        noiseMax: updatedValue.noiseMax,
        pm1Min: updatedValue.pm1Min,
        pm1Max: updatedValue.pm1Max,
        pm25Min: updatedValue.pm25Min,
        pm25Max: updatedValue.pm25Max,
        pm4Min: updatedValue.pm4Min,
        pm4Max: updatedValue.pm4Max,
        pm10Min: updatedValue.pm10Min,
        pm10Max: updatedValue.pm10Max,
        aiqMin: updatedValue.aiqMin,
        aiqMax: updatedValue.aiqMax,
        gas1Min: updatedValue.gas1Min,
        gas1Max: updatedValue.gas1Max,
        gas2Min: updatedValue.gas2Min,
        gas2Max: updatedValue.gas2Max,
        gas3Min: updatedValue.gas3Min,
        gas3Max: updatedValue.gas3Max,
        gas4Min: updatedValue.gas4Min,
        gas4Max: updatedValue.gas4Max,
        gas5Min: updatedValue.gas5Min,
        gas5Max: updatedValue.gas5Max,
        gas6Min: updatedValue.gas6Min,
        gas6Max: updatedValue.gas6Max,
        deviceId: updatedValue.deviceId,
      }
    );
    return res.customSuccess(
      200,
      "Device Range Fetched Successfully",
      deviceRange
    );
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};