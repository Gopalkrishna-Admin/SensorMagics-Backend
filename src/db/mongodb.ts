import mongoose from "mongoose";
import {
  IClient,
  IDevice,
  IUser,
  IWeatherData,
  ERole,
  EStatus,
  IGasMapping,
  ISession,
  INotification,
  IWeatherDataRange,
  IPreference,
  IJob,
  EJobStatus,
} from "types/mongodb";
import { ulid } from "ulid";

const { Schema } = mongoose;

const roles = [ERole.ADMIN, ERole.USER];
const statuses = [
  EStatus.REGISTERED,
  EStatus.CONNECTED,
  EStatus.ACTIVATED,
  EStatus.DEACTIVATED,
  EStatus.BLOCKED,
  EStatus.UNREGISTERED,
  EStatus.TERMINATED,
];
const jobStatuses = [EJobStatus.COMPLETED, EJobStatus.STARTED, EJobStatus.FAILED, EJobStatus.IN_PROGRESS];

const jobSchema = new Schema({
  id: { type: String, default: ulid(), unique: true, required: true },
  deviceId: { type: String, required: true },
  userId: {type: String, required: true},
  status: { type: String, required: true,enum: jobStatuses },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  result: { type: String },
  note: {type: String}
},{
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
});

const userSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, unique: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    deactivated: { type: Boolean, default: false },
    role: { type: String, enum: roles, required: true },
    clientId: { type: String, ref: "Client" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const clientSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, unique: true },
    logo: { type: Buffer },
    logoMimeType: {type:String},  
    address: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    website: { type: String },
    bannerMessage: { type: String },
    showBanner: { type: Boolean },
    bannerLink: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const deviceSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    name: { type: String, required: true },
    identifier: { type: String, required: true },
    status: { type: String, enum: statuses, required: true },
    location: { type: String, required: true },
    clientId: { type: String, ref: "Client" },
    modelType: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const sessionSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, ref: "User", required: true },
  jwt: { type: String, required: true },
  isValid: { type: Boolean, default: true },
});

const userPreferenceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, ref: "User", required: true },
  preference: {
    type: String,
    required: true,
  },
});

const notificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, ref: "User", required: true },
  notification: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const gasMappingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    gas1: { type: String, required: true },
    gas2: { type: String, required: true },
    gas3: { type: String, required: true },
    gas4: { type: String, required: true },
    gas5: { type: String, required: true },
    gas6: { type: String, required: true },
    clientId: { type: String, ref: "Client" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const userDeviceMappingSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    userId: { type: String, ref: "User", required: true },
    deviceId: { type: String, ref: "Device", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

userDeviceMappingSchema.index({ deviceId: 1, userId: 1 }, { unique: true });

const weatherDataRangeSchema = new Schema({
  id: { type: String, default: ulid(), unique: true, required: true },
  temperatureMin: { type: Number, required: true },
  temperatureMax: { type: Number, required: true },
  humidityMin: { type: Number, required: true },
  humidityMax: { type: Number, required: true },
  pressureMin: { type: Number, required: true },
  pressureMax: { type: Number, required: true },
  co2Min: { type: Number, required: true },
  co2Max: { type: Number, required: true },
  vocsMin: { type: Number, required: true },
  vocsMax: { type: Number, required: true },
  lightMin: { type: Number, required: true },
  lightMax: { type: Number, required: true },
  noiseMin: { type: Number, required: true },
  noiseMax: { type: Number, required: true },
  oderMin: { type: Number, required: true },
  odorMax: { type: Number, required: true },
  moldGrowthMin: { type: Number, required: true },
  moldGrowthMax: { type: Number, required: true },
  pm1Min: { type: Number, required: true },
  pm1Max: { type: Number, required: true },
  pm25Min: { type: Number, required: true },
  pm25Max: { type: Number, required: true },
  pm4Min: { type: Number, required: true },
  pm4Max: { type: Number, required: true },
  pm10Min: { type: Number, required: true },
  pm10Max: { type: Number, required: true },
  aiqMin: { type: Number, required: true },
  aiqMax: { type: Number, required: true },
  gas1Min: { type: Number, required: true },
  gas1Max: { type: Number, required: true },
  gas2Min: { type: Number, required: true },
  gas2Max: { type: Number, required: true },
  gas3Min: { type: Number, required: true },
  gas3Max: { type: Number, required: true },
  gas4Min: { type: Number, required: true },
  gas4Max: { type: Number, required: true },
  gas5Min: { type: Number, required: true },
  gas5Max: { type: Number, required: true },
  gas6Min: { type: Number, required: true },
  gas6Max: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  deviceId: { type: String, ref: "Device", required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const weatherDataSchema = new Schema(
  {
    id: { type: String, default: ulid(), unique: true, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    pressure: { type: Number, required: true },
    co2: { type: Number, required: true },
    vocs: { type: Number, required: true },
    light: { type: Number, required: true },
    noise: { type: Number, required: true },
    pm1: { type: Number, required: true },
    pm25: { type: Number, required: true },
    pm4: { type: Number, required: true },
    pm10: { type: Number, required: true },
    aiq: { type: Number, required: true },
    gas1: { type: Number, required: true },
    gas2: { type: Number, required: true },
    gas3: { type: Number, required: true },
    gas4: { type: Number, required: true },
    gas5: { type: Number, required: true },
    gas6: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    deviceId: { type: String, ref: "Device", required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    timeseries: {
      timeField: "timestamp",
      granularity: "seconds",
    },
  }
);
const User = mongoose.model<IUser>("User", userSchema);
const Job = mongoose.model<IJob>("Job", jobSchema);
const Client = mongoose.model<IClient>("Client", clientSchema);
const Device = mongoose.model<IDevice>("Device", deviceSchema);
const UserDeviceMapping = mongoose.model(
  "UserDeviceMapping",
  userDeviceMappingSchema
);
const WeatherData = mongoose.model<IWeatherData>(
  "WeatherData",
  weatherDataSchema
);

const WeatherDataRange = mongoose.model<IWeatherDataRange>(
  "WeatherDataRange",
  weatherDataRangeSchema
);

const GasMapping = mongoose.model<IGasMapping>("GasMapping", gasMappingSchema);
const SessionMapping = mongoose.model<ISession>(
  "SessionMapping",
  sessionSchema
);

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

const Preference = mongoose.model<IPreference>(
  "Preference",
  userPreferenceSchema
);

export {
  Client,
  Device,
  User,
  UserDeviceMapping,
  WeatherData,
  GasMapping,
  SessionMapping,
  Notification,
  WeatherDataRange,
  Preference,
  Job
};
