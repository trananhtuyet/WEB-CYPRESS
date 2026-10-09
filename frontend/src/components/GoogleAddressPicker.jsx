import { useEffect, useRef, useState } from "react";

const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const defaultCenter = { lat: 10.7769, lng: 106.7009 };

let googleMapsPromise;

const loadGoogleMaps = () => {
  if (!googleMapsApiKey) {
    return Promise.reject(new Error("Missing Google Maps API key"));
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (!googleMapsPromise) {
    googleMapsPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector("script[data-google-maps-loader='true']");

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(window.google), { once: true });
        existingScript.addEventListener("error", reject, { once: true });
        return;
      }

      const script = document.createElement("script");
      const params = new URLSearchParams({
        key: googleMapsApiKey,
        libraries: "places",
        language: "vi",
        region: "VN",
      });

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.dataset.googleMapsLoader = "true";
      script.onload = () => resolve(window.google);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  return googleMapsPromise;
};

const reverseGeocodeWithOpenStreetMap = async ({ lat, lng }) => {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    "accept-language": "vi",
  });

  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Cannot reverse geocode location");
  }

  const data = await response.json();
  return data.display_name || "";
};

function GoogleAddressPicker({ value, onChange, required = false }) {
  const inputRef = useRef(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerInstance = useRef(null);
  const geocoderInstance = useRef(null);
  const onChangeRef = useRef(onChange);
  const [status, setStatus] = useState(googleMapsApiKey ? "loading" : "missing-key");
  const [coordinates, setCoordinates] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [manualOpen, setManualOpen] = useState(!googleMapsApiKey);
  const [locationStatus, setLocationStatus] = useState("");

  const getAccuracyMessage = (value) => {
    if (!value) return "";
    if (value <= 50) return `Độ chính xác khoảng ${Math.round(value)}m.`;
    if (value <= 150) return `Độ chính xác khoảng ${Math.round(value)}m, nên kiểm tra lại địa chỉ.`;
    return `Độ chính xác còn thấp, khoảng ${Math.round(value)}m. Vui lòng chỉnh lại địa chỉ nếu cần.`;
  };

  const applyLocation = async (location, address = "", accuracyValue = null) => {
    const lat = typeof location.lat === "function" ? location.lat() : location.lat;
    const lng = typeof location.lng === "function" ? location.lng() : location.lng;
    const nextPosition = { lat, lng };

    setCoordinates(nextPosition);
    setAccuracy(accuracyValue);
    markerInstance.current?.setPosition(nextPosition);
    mapInstance.current?.panTo(nextPosition);

    if (address) {
      onChangeRef.current(address);
      if (accuracyValue) {
        setLocationStatus(`Đã lấy địa chỉ từ vị trí hiện tại. ${getAccuracyMessage(accuracyValue)}`);
      }
      return;
    }

    try {
      setLocationStatus("Đang đổi tọa độ thành địa chỉ...");
      const fallbackAddress = await reverseGeocodeWithOpenStreetMap(nextPosition);
      if (fallbackAddress) {
        onChangeRef.current(fallbackAddress);
        setLocationStatus(`Đã lấy địa chỉ từ vị trí hiện tại. ${getAccuracyMessage(accuracyValue)}`);
        return;
      }
    } catch {
      setLocationStatus("Không đổi được tọa độ thành địa chỉ. Vui lòng nhập thủ công nếu cần.");
    }

    onChangeRef.current(`Vị trí hiện tại: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
  };

  const reverseGeocode = (location, accuracyValue = null) => {
    if (!geocoderInstance.current) {
      applyLocation(location, "", accuracyValue);
      return;
    }

    geocoderInstance.current.geocode({ location }, (results, geocodeStatus) => {
      if (geocodeStatus === "OK" && results?.[0]) {
        applyLocation(location, results[0].formatted_address, accuracyValue);
        return;
      }

      applyLocation(location, "", accuracyValue);
    });
  };

  const getBestCurrentPosition = () =>
    new Promise((resolve, reject) => {
      let bestPosition = null;
      let resolved = false;
      let attempts = 0;

      const finish = () => {
        if (resolved) return;
        resolved = true;
        if (bestPosition) {
          resolve(bestPosition);
          return;
        }
        reject(new Error("Cannot get current location"));
      };

      const requestPosition = () => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            attempts += 1;
            if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
              bestPosition = position;
            }

            if (position.coords.accuracy <= 50 || attempts >= 3) {
              finish();
              return;
            }

            requestPosition();
          },
          (error) => {
            if (bestPosition) {
              finish();
              return;
            }
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0,
          }
        );
      };

      requestPosition();
      window.setTimeout(finish, 22000);
    });

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus("Trình duyệt không hỗ trợ lấy vị trí hiện tại.");
      setManualOpen(true);
      return;
    }

    setLocationStatus("Đang lấy vị trí chính xác hơn...");
    try {
      const position = await getBestCurrentPosition();
      const nextPosition = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      if (mapInstance.current) {
        mapInstance.current.setZoom(17);
      }
      reverseGeocode(nextPosition, position.coords.accuracy);
    } catch {
      setLocationStatus("Không lấy được vị trí. Vui lòng cho phép quyền vị trí hoặc nhập thủ công.");
      setManualOpen(true);
    }
  };

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let mounted = true;

    loadGoogleMaps()
      .then((google) => {
        if (!mounted || !inputRef.current || !mapRef.current) return;

        geocoderInstance.current = new google.maps.Geocoder();
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        markerInstance.current = new google.maps.Marker({
          map: mapInstance.current,
          position: defaultCenter,
          draggable: true,
        });

        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          componentRestrictions: { country: "vn" },
          fields: ["formatted_address", "geometry", "name"],
        });

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (place.geometry?.location) {
            applyLocation(place.geometry.location, place.formatted_address || place.name || inputRef.current.value);
            mapInstance.current.setZoom(16);
            return;
          }

          if (inputRef.current.value) {
            geocoderInstance.current.geocode({ address: inputRef.current.value }, (results, geocodeStatus) => {
              if (geocodeStatus === "OK" && results?.[0]) {
                applyLocation(results[0].geometry.location, results[0].formatted_address);
              }
            });
          }
        });

        mapInstance.current.addListener("click", (event) => {
          reverseGeocode(event.latLng);
        });

        markerInstance.current.addListener("dragend", (event) => {
          reverseGeocode(event.latLng);
        });

        setStatus("ready");
      })
      .catch(() => {
        if (mounted) {
          setStatus("missing-key");
          setManualOpen(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="google-address-picker">
      <label>
        Tìm địa chỉ trên Google Maps
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => onChangeRef.current(event.target.value)}
          placeholder="Nhập địa chỉ hoặc chọn trực tiếp trên bản đồ"
          required={required}
        />
      </label>

      {status === "ready" && <div className="google-address-map" ref={mapRef} />}

      <div className="google-address-actions">
        <button type="button" onClick={handleUseCurrentLocation}>
          Lấy vị trí hiện tại
        </button>
        <button
          type="button"
          className="google-address-manual-toggle"
          onClick={() => setManualOpen((current) => !current)}
        >
          {manualOpen ? "Ẩn nhập thủ công" : "Nhập địa chỉ thủ công"}
        </button>
      </div>

      {(status === "ready" || coordinates || locationStatus) && (
        <small>
          {status === "ready" ? "Chọn gợi ý địa chỉ, bấm lên bản đồ hoặc kéo ghim để lấy địa chỉ chính xác." : ""}
          {coordinates ? ` Tọa độ: ${coordinates.lat.toFixed(5)}, ${coordinates.lng.toFixed(5)}.` : ""}
          {accuracy ? ` Sai số: ${Math.round(accuracy)}m.` : ""}
          {locationStatus ? ` ${locationStatus}` : ""}
        </small>
      )}

      {manualOpen && (
        <label className="google-address-manual">
          Địa chỉ nhập thủ công
          <textarea
            rows="4"
            value={value}
            onChange={(event) => onChangeRef.current(event.target.value)}
            placeholder="Ví dụ: Số 48 Nguyễn Trãi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh"
            required={required}
          />
        </label>
      )}
    </div>
  );
}

export default GoogleAddressPicker;
