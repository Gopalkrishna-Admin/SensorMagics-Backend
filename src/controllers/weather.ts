import { Job, WeatherData } from "db/mongodb";
import { NextFunction, Request, Response } from "express";
import { EJobStatus, IWeatherData } from "types/mongodb";
import { ulid } from "ulid";
import { AttachmentData, sendEmail } from "utils/email";
import { CustomError } from "utils/response/custom-error/CustomError";
import XLSX from 'xlsx';

const metrics: FieldKeys[] = [
  "timestamp",
  "temperature",
  "humidity",
  "pressure",
  "co2",
  "vocs",
  "light",
  "noise",
  "pm1",
  "pm25",
  "pm4",
  "pm10",
  "aiq",
  "gas1",
  "gas2",
  "gas3",
  "gas4",
  "gas5",
  "gas6"
];

export const getData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.params.id;
    const endDate = new Date(req.params.to);
    const startDate = new Date(req.params.from);
    const metric = req.params.metric;

    // Define the valid metrics to select from
    const validMetrics:{ [key in keyof IWeatherData]?: 1 } = {
      temperature: 1,
      humidity: 1,
      pressure: 1,
      co2: 1,
      vocs: 1,
      light: 1,
      noise: 1,
      pm1: 1,
      pm25: 1,
      pm4: 1,
      pm10: 1,
      aiq: 1,
      gas1: 1,
      gas2: 1,
      gas3: 1,
      gas4: 1,
      gas5: 1,
      gas6: 1,
    };

    // Check if the requested metric is valid
    if (!validMetrics.hasOwnProperty(metric)) {
      return res.status(400).json({ message: "Invalid metric" });
    }

    // Dynamically select only the requested metric along with timestamp
    const projection = {
      timestamp: 1,
      [metric]: 1,
      _id: 0, // exclude _id
    };

    const allData: IWeatherData[] = await WeatherData.find(
      { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
      projection,
    ).lean();

    const dataToSend = allData.map((d) => {
      const dateInUTC = new Date(d.timestamp);
      const istOffset = 5.5 * 60 * 60 * 1000;
      const dateInIST = new Date(dateInUTC.getTime() + istOffset);
      const dateString = `${dateInIST.toDateString()} ${dateInIST.toTimeString().split(" ")[0]}`;
      return {
        [metric]: parseFloat((d as any)[metric]?.toFixed(2)),
        dateString,
      };
    });

    return res.customSuccess(200, "Fetched Successfully", dataToSend);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};



export const getLatestData = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const deviceId = req.params.id;
    const latestData = await WeatherData.findOne(
      { deviceId },
      {
        timestamp: 1,
        temperature: 1,
        humidity: 1,
        pressure: 1,
        co2: 1,
        vocs: 1,
        light: 1,
        noise: 1,
        pm1: 1,
        pm25: 1,
        pm4: 1,
        pm10: 1,
        aiq: 1,
        gas1: 1,
        gas2: 1,
        gas3: 1,
        gas4: 1,
        gas5: 1,
        gas6: 1,
        _id: 0
      }
    )
      .sort({ timestamp: -1 })
      .lean();
      const istOffset = 5.5 * 60 * 60 * 1000;
    const dataToSend =  latestData && {
      temperature: parseFloat(latestData.temperature.toFixed(2)),
      humidity: parseFloat(latestData.humidity.toFixed(2)),
      pressure: parseFloat(latestData.pressure.toFixed(2)),
      co2: parseFloat(latestData.co2.toFixed(2)),
      vocs: parseFloat(latestData.vocs.toFixed(2)),
      light: parseFloat(latestData.light.toFixed(2)),
      noise: parseFloat(latestData.noise.toFixed(2)),
      pm1: parseFloat(latestData.pm1.toFixed(2)),
      pm25: parseFloat(latestData.pm25.toFixed(2)),
      pm4: parseFloat(latestData.pm4.toFixed(2)),
      pm10: parseFloat(latestData.pm10.toFixed(2)),
      aiq: parseFloat(latestData.aiq.toFixed(2)),
      gas1: parseFloat(latestData.gas1.toFixed(2)),
      gas2: parseFloat(latestData.gas2.toFixed(2)),
      gas3: parseFloat(latestData.gas3.toFixed(2)),
      gas4: parseFloat(latestData.gas4.toFixed(2)),
      gas5: parseFloat(latestData.gas5.toFixed(2)),
      gas6: parseFloat(latestData.gas6.toFixed(2)),
      dateString:`${new Date(latestData.timestamp.getTime()+istOffset).toDateString()} ${new Date(latestData.timestamp.getTime()+istOffset).toTimeString().split(" ")[0]}`,
    };

    return res.customSuccess(200, "Fetched Successfully", dataToSend);
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error fetching data", null, err);
    return next(customError);
  }
};


export const createDataFromPostman = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const endDate = new Date(req.body.to);
    const oldDate = new Date(req.body.from);
    const deviceId = req.body.deviceId;
    const data = [];
    const currentDate = new Date(oldDate);
    while (currentDate < endDate) {
      data.push({
        timestamp: new Date(currentDate),
        temperature: Math.random() * 15 + 10,
        humidity: Math.random() * 30 + 40,
        pressure: Math.random() * 34 + 11,
        co2: Math.random() * 34 + 11,
        vocs: Math.random() * 34 + 11,
        light: Math.random() * 34 + 11,
        noise: Math.random() * 34 + 11,
        pm1: Math.random() * 34 + 11,
        pm25: Math.random() * 34 + 11,
        pm4: Math.random() * 34 + 11,
        pm10: Math.random() * 34 + 11,
        aiq: Math.random() * 34 + 11,
        gas1: Math.random() * 34 + 11,
        gas2: Math.random() * 34 + 11,
        gas3: Math.random() * 34 + 11,
        gas4: Math.random() * 34 + 11,
        gas5: Math.random() * 34 + 11,
        gas6: Math.random() * 34 + 11,
        deviceId,
      });
      currentDate.setSeconds(currentDate.getSeconds() + 60);
    }
    await WeatherData.insertMany(data);
    return res.customSuccess(200, "Created Successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

export const generateReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;
    const deviceId = req.body.deviceId;
    const startDate = new Date(req.body.from);
    const endDate = new Date(req.body.to);
    const jobId = ulid();
    await Job.create({ id: jobId, deviceId, userId, status: EJobStatus.STARTED });
    generateAndSendEmail(deviceId, startDate, endDate, jobId, metrics, userEmail);
    await Job.updateOne({id: jobId}, {status: EJobStatus.IN_PROGRESS, note: `Generating report for ${deviceId} from ${startDate} to ${endDate} and will send email to ${userEmail}`});
    return res.customSuccess(200, "Generation job started successfully");
  } catch (err) {
    const customError = new CustomError(500, "Raw", "Error", null, err);
    return next(customError);
  }
};

const fieldMap = {
  timestamp: "Date",
  temperature: "Temperature",
  humidity: "Humidity",
  pressure: "Pressure",
  co2: "Carbon-Dioxide",
  vocs: "VOCs",
  light: "Light",
  noise: "Noise",
  pm1: "PM1",
  pm25: "PM2.5",
  pm4: "PM4",
  pm10: "PM10",
  aiq: "AIQ",
  gas1: "Gas-1",
  gas2: "Gas-2",
  gas3: "Gas-3",
  gas4: "Gas-4",
  gas5: "Gas-5",
  gas6: "Gas-6"
};

type FieldKeys = keyof typeof fieldMap;

async function queryWeatherData(deviceId: string, startDate: Date, endDate: Date, fields: FieldKeys[]) {
  const projection = fields.reduce((acc, field) => {
    if (fieldMap[field]) {
      acc[field] = 1;
    }
    return acc;
  }, {} as Record<string, number>);
  projection['timestamp'] = 1;
  const data = await WeatherData.find(
    { timestamp: { $gte: startDate, $lte: endDate }, deviceId },
    projection,
  )
  .sort({ timestamp: 1 })
  .lean();
  return data;
}

function generateReportExcel(data: IWeatherData[], fields: FieldKeys[]): Buffer {
  const headers = fields.map(field => fieldMap[field] || field);
  const sheetData = data.map((row) => {
    return fields.map(field => {
      if (field === 'timestamp') {
        return `${new Date(row[field]).toDateString()} ${new Date(row[field]).toTimeString().split(" ")[0]}`;
      }else if(field === "temperature"){
        return parseFloat(row[field].toFixed(2))
      }
      return parseFloat(row[field].toFixed(0));
    });
  });
  sheetData.unshift(headers); 
  const workbook = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(workbook, ws, 'Report');
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
}


async function sendReportEmail(email: string, deviceId: string, startDate: Date, endDate: Date, buffer: Buffer) {
  const base64File = buffer.toString('base64');
  const attachments: AttachmentData[] = [
    {
      content: base64File,
      disposition: "attachment",
      filename: `Report of ${deviceId}.xlsx`,
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  ];
  await sendEmail({
    from: process.env.SENDGRID_FROM!,
    to: email,
    html: "Attached is your requested weather report.",
    subject: `Report of ${deviceId} (${startDate.toDateString()} - ${endDate.toDateString()})`,
    attachments,
  });
}


export async function generateAndSendEmail(
  deviceId: string, 
  startDate: Date, 
  endDate: Date, 
  jobId: string, 
  fields: FieldKeys[], 
  email?: string
) {
  try {
    const validFields = fields.filter(field => fieldMap[field]);
    const allData: IWeatherData[] = await queryWeatherData(deviceId, startDate, endDate, validFields);
    const reportBuffer = generateReportExcel(allData, validFields);
    if (email) {
      await sendReportEmail(email, deviceId, startDate, endDate, reportBuffer);
      await Job.updateOne({ id: jobId }, { status: EJobStatus.COMPLETED, result: reportBuffer.toString('base64'), note: "Sent email" });
    } else {
      await Job.updateOne({ id: jobId }, { status: EJobStatus.COMPLETED, result: reportBuffer.toString('base64'), note: "Did not send email" });
    }
  } catch (err) {
    await Job.updateOne({ id: jobId }, { status: EJobStatus.FAILED, result: err });
  }
}
