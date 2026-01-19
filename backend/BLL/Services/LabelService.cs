using BLL.Interfaces;
using DAL.Interfaces;
using DTOs.Entities;
using DTOs.Requests;
using DTOs.Responses;

namespace BLL.Services
{
    public class LabelService : ILabelService
    {
        private readonly ILabelRepository _labelRepo;

        public LabelService(ILabelRepository labelRepo)
        {
            _labelRepo = labelRepo;
        }

        public async Task<LabelResponse> CreateLabelAsync(CreateLabelRequest request)
        {
            if (await _labelRepo.ExistsInProjectAsync(request.ProjectId, request.Name))
                throw new Exception("Label name already exists in this project.");

            var label = new LabelClass
            {
                ProjectId = request.ProjectId,
                Name = request.Name,
                Color = request.Color,
                GuideLine = request.GuideLine
            };

            await _labelRepo.AddAsync(label);
            await _labelRepo.SaveChangesAsync();

            return new LabelResponse { Id = label.Id, Name = label.Name, Color = label.Color };
        }

        public async Task<LabelResponse> UpdateLabelAsync(int labelId, UpdateLabelRequest request)
        {
            var label = await _labelRepo.GetByIdAsync(labelId);
            if (label == null) throw new Exception("Label not found");

            label.Name = request.Name;
            label.Color = request.Color;
            label.GuideLine = request.GuideLine;

            _labelRepo.Update(label);
            await _labelRepo.SaveChangesAsync();

            return new LabelResponse { Id = label.Id, Name = label.Name, Color = label.Color };
        }

        public async Task DeleteLabelAsync(int labelId)
        {
            var label = await _labelRepo.GetByIdAsync(labelId);
            if (label == null) throw new Exception("Label not found");

            _labelRepo.Delete(label);
            await _labelRepo.SaveChangesAsync();
        }
    }
}