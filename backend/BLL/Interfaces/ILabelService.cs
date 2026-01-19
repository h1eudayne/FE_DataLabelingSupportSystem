using DTOs.Requests;
using DTOs.Responses;

namespace BLL.Interfaces
{
    public interface ILabelService
    {
        Task<LabelResponse> CreateLabelAsync(CreateLabelRequest request);
        Task<LabelResponse> UpdateLabelAsync(int labelId, UpdateLabelRequest request);
        Task DeleteLabelAsync(int labelId);
    }
}