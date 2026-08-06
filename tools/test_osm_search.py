import json
import requests

queries = {
    "old_barbearia": '''[out:json][timeout:20]; area[name="Niterói"]->.a; (node["amenity"~"barbearia|restaurant|cafe|clinic|dentist|pharmacy|bank|gym",i](area.a); node["shop"~"barbearia|supermarket|bakery|clothes|mall",i](area.a); node["craft"~"barbearia",i](area.a); way["amenity"~"barbearia|restaurant|cafe|clinic|dentist|pharmacy",i](area.a); way["shop"~"barbearia",i](area.a);); out body;''',
    "new_barbearia": '''[out:json][timeout:40]; area["name"~"^Niterói$",i]["boundary"="administrative"]->.a; (nwr["name"~"barbearia|barber|hairdresser|cabeleireiro|barbershop",i](area.a); nwr["shop"~"barbearia|barber|hairdresser|cabeleireiro|barbershop|beauty",i](area.a); nwr["craft"~"barbearia|barber|hairdresser|cabeleireiro|barbershop",i](area.a); nwr["amenity"~"barbearia|barber|hairdresser|cabeleireiro|barbershop",i](area.a);); out center tags;''',
    "new_restaurante": '''[out:json][timeout:40]; area["name"~"^Niterói$",i]["boundary"="administrative"]->.a; (nwr["name"~"restaurante",i](area.a); nwr["amenity"~"restaurant",i](area.a); nwr["shop"~"restaurant",i](area.a);); out center tags;''',
}

for name, query in queries.items():
    last = None
    for endpoint in ("https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"):
        try:
            response = requests.post(endpoint, data={"data": query}, headers={"User-Agent": "PerfilPro-SearchAudit/1.0"}, timeout=50)
            response.raise_for_status()
            elements = response.json().get("elements", [])
            named = [e for e in elements if e.get("tags", {}).get("name")]
            sample = [{"name": e.get("tags", {}).get("name"), "shop": e.get("tags", {}).get("shop"), "amenity": e.get("tags", {}).get("amenity"), "craft": e.get("tags", {}).get("craft")} for e in named[:15]]
            print(json.dumps({"query": name, "elements": len(elements), "named": len(named), "sample": sample}, ensure_ascii=False))
            break
        except Exception as exc:
            last = str(exc)
    else:
        print(json.dumps({"query": name, "error": last}, ensure_ascii=False))
