export enum SWPC {
  OVATION_MAP = 'ovation_map',
  FORECAST_SOLARWIND = 'forecast_solarwind',
  FORECAST_SOLARCYCLE = 'forecast_solarcycle',
  FORECAST_KP = 'forecast_kp',
  INSTANT_KP = 'instant_kp',
  INSTANT_NOWCAST = 'instant_nowcast',
  POLE_NORTH = 'pole_north',
  POLE_SOUTH = 'pole_south',
  TWENTY_SEVEN_DAYS = 'twenty_seven_days',
}

export enum SERVICES_SWPC {
  OVATION_MAP = 'https://services.swpc.noaa.gov/json/ovation_aurora_latest.json',
  FORECAST_SOLARWIND = 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
  FORECAST_SOLARCYCLE = 'https://services.swpc.noaa.gov/json/solar-cycle/predicted-solar-cycle.json',
  FORECAST_KP = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',
  INSTANT_KP = 'https://services.swpc.noaa.gov/json/boulder_k_index_1m.json',
  INSTANT_NOWCAST = 'https://services.swpc.noaa.gov/products/geospace/propagated-solar-wind-1-hour.json',
  POLE_NORTH = 'https://services.swpc.noaa.gov/products/animations/ovation_north_24h.json',
  POLE_SOUTH = 'https://services.swpc.noaa.gov/products/animations/ovation_south_24h.json',
  TWENTY_SEVEN_DAYS = 'https://services.swpc.noaa.gov/text/27-day-outlook.txt',
}
