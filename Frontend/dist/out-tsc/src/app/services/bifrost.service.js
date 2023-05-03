import { __decorate } from "tslib";
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
let BifrostService = class BifrostService {
    constructor(http) {
        this.http = http;
        this.apiUrl = 'https://api.psychonautwiki.org/';
    }
    getDrugInfo(drugName) {
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
        return this.http.post(this.apiUrl, { query }).pipe(map(response => response.data.substances[0]));
    }
};
BifrostService = __decorate([
    Injectable({
        providedIn: 'root'
    })
], BifrostService);
export { BifrostService };
//# sourceMappingURL=bifrost.service.js.map