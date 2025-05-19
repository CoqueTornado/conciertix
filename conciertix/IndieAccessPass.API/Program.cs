using IndieAccessPass.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using IndieAccessPass.API.Services;

// This is the main entry point for the ASP.NET Core application.
// It configures services and the application's request processing pipeline.

var builder = WebApplication.CreateBuilder(args);

// --- Service Configuration ---

// 1. Database Context:
// Configures Entity Framework Core to use PostgreSQL as the database provider.
// The connection string "DefaultConnection" is retrieved from appsettings.json.
// Throws an InvalidOperationException if the connection string is not found.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Database connection string 'DefaultConnection' is not configured in appsettings.json.")));

// 2. Controllers:
// Adds services for controllers, enabling them to be resolved by the dependency injection container.
builder.Services.AddControllers();

// 3. Custom Application Services:
// Registers custom services with scoped lifetime (one instance per HTTP request).
// - TicketService: For generating PDF tickets.
// - IEmailService (implemented by EmailService): For sending emails.
// - CalendarService: For generating iCalendar (.ics) files.
builder.Services.AddScoped<TicketService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<CalendarService>();

// 4. API Explorer & Swagger/OpenAPI:
// - AddEndpointsApiExplorer: Discovers API endpoints.
// - AddSwaggerGen: Configures Swagger to generate API documentation.
//   - Defines a "v1" document for the API.
//   - Configures Bearer Token authentication for Swagger UI, allowing users to authorize requests.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "IndieAccessPass API", Version = "v1" });
    // Configure JWT Bearer token authentication for Swagger UI
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid JWT token. Example: \"Bearer {token}\"",
        Name = "Authorization",
        Type = SecuritySchemeType.Http, // Using HTTP-based scheme
        BearerFormat = "JWT",          // Token format
        Scheme = "Bearer"              // Scheme name
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" // Must match the Id in AddSecurityDefinition
                }
            },
            new string[]{} // Empty array indicates no specific scopes are required
        }
    });
});

// 5. JWT Authentication:
// Configures JWT Bearer authentication.
// - Sets default authentication schemes.
// - Configures token validation parameters (issuer, audience, signing key).
//   These values are retrieved from the "Jwt" section of appsettings.json.
//   Throws InvalidOperationException if JWT settings are missing.
// TODO: Set ValidateLifetime = true for production environments for enhanced security.
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = builder.Configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer (Jwt:Issuer) is not configured in appsettings.json."),
        ValidAudience = builder.Configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience (Jwt:Audience) is not configured in appsettings.json."),
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT Key (Jwt:Key) is not configured in appsettings.json."))),
        
        ValidateIssuer = true,       // Validates the server that generates the token.
        ValidateAudience = true,     // Validates the recipient of the token is authorized to receive it.
        ValidateLifetime = false,    // TODO: Set to true in production. Validates that the token isn't expired and the signing key is still valid.
        ValidateIssuerSigningKey = true // Validates the signature of the token.
    };
});

// 6. CORS (Cross-Origin Resource Sharing):
// Configures CORS policy to allow requests from the frontend application (http://localhost:5173).
// - Allows specific headers and methods.
// - Allows credentials (e.g., cookies, authorization headers).
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policyBuilder => // Renamed 'builder' to 'policyBuilder' to avoid conflict with 'WebApplication.CreateBuilder'
        {
            policyBuilder.WithOrigins("http://localhost:5173") // Frontend URL
                   .WithHeaders("Content-Type", "Authorization", "Origin", "Accept", "X-Requested-With") // Allowed headers
                   .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Allowed HTTP methods
                   .AllowCredentials(); // Allows cookies and authentication headers
        });
});

// 7. Authorization:
// Adds authorization services, enabling the use of [Authorize] attributes on controllers and actions.
builder.Services.AddAuthorization();

// --- Application Building ---
var app = builder.Build();

// --- HTTP Request Pipeline Configuration ---

// 1. Development Environment Specifics:
// - UseSwagger: Enables Swagger middleware to serve generated Swagger JSON.
// - UseSwaggerUI: Enables Swagger UI middleware for interactive API documentation.
// These are typically only enabled in development environments.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Consider adding app.UseDeveloperExceptionPage(); for detailed error pages in development.
}

// 2. HTTPS Redirection:
// Redirects HTTP requests to HTTPS for enhanced security.
app.UseHttpsRedirection();

// 3. Routing:
// Adds routing middleware to match incoming requests to endpoints.
// Explicitly adding UseRouting() before UseCors() and UseAuthentication()/UseAuthorization() is good practice
// to ensure the routing decision is made before CORS or Auth policies are applied.
app.UseRouting();

// 4. CORS Middleware:
// Applies the "AllowFrontend" CORS policy defined earlier.
// This must be called before UseAuthentication and UseAuthorization.
app.UseCors("AllowFrontend");

// 5. Authentication Middleware:
// Adds authentication middleware to the pipeline, enabling JWT token processing.
app.UseAuthentication();

// 6. Authorization Middleware:
// Adds authorization middleware, enforcing access control based on [Authorize] attributes.
app.UseAuthorization();

// 7. Controller Mapping:
// Maps controller actions to endpoints, making them routable.
app.MapControllers();

// --- Application Start ---
// Runs the application, starting the web server and listening for incoming requests.
app.Run();
