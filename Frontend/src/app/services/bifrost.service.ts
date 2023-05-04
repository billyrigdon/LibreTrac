import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BifrostService {

  private readonly apiUrl = 'https://api.psychonautwiki.org/';

  constructor(private http: HttpClient) { }

  getDrugInfo(drugName: string): Observable<any> {
    const query = `
      query {
        substances(query: "${drugName}") {
          name
          summary
          effects {
            name
          }
          tolerance {
            full
            half
            zero
          }
          roa {
            oral {
              dose {
                units
                threshold
                heavy
                light {
                  min
                  max
                }
                common {
                  min
                  max
                }
                strong {
                  min
                  max
                }
              }
            }
          }
          uncertainInteractions {
            name
          }
          unsafeInteractions {
            name
          }
          dangerousInteractions {
            name
          }
        }
      }
    `;

    return this.http.post<any>(this.apiUrl, { query }).pipe(
      map(response => response.data.substances[0])
    );
  }
}
